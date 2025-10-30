import express from "express";
import { UserModel } from "../../models/UserModel.mjs";
import bcrypt from "bcryptjs";

export class APIAuthenticationController {
  static middleware = express.Router();
  static routes = express.Router();

  static {
    this.middleware.use(this.#APIAuthenticationProvider);
    this.routes.post("/authenticate", this.handleAuthenticate);
    this.routes.delete(
      "/authenticate",
      this.restrict("any"),
      this.handleAuthenticate
    );
  }

  /**
   *
   * @private
   * @type {express.RequestHandler}
   */
  static async #APIAuthenticationProvider(req, res, next) {
    console.log("I have been called");
    console.log(req.headers["x-auth-key"]);
    const authenticationKey = req.headers["x-auth-key"];
    if (authenticationKey) {
      console.log("successful");
      try {
        req.authenticatedUser = await UserModel.getByAuthenticationKey(
          authenticationKey
        );
      } catch (error) {
        console.log("Not working");
        if (error == "not found") {
          res.status(404).json({ message: "Key not found" });
        } else {
          console.error(error);
          res.status(500).json({
            message: "Failed to authenticate - Database error",
          });
        }
        return;
      }
    }
    next();
  }

  /**
   *
   * @type {express.RequestHandler}
   */

  static async handleAuthenticate(req, res) {
    if (req.method == "POST") {
      try {
        const user = await UserModel.getByUsername(req.body.email);
        if (await bcrypt.compare(req.body.password, user.password)) {
          const authenticationKey = crypto.randomUUID();

          user.authenticationKey = authenticationKey;
          await UserModel.update(user);
          res.status(200).json({
            message: "Successfully authenticated",
            key: user.authenticationKey,
          });
        } else {
          res.status(400).json({ message: "Invalid credentials" });
        }
      } catch (error) {
        switch (error) {
          case "not found":
            res.status(400).json({ message: "Invalid credentials" });
            break;
          default:
            console.error(error);
            res.status(500).json({ message: "Failed to authenticate user" });
            break;
        }
      }
    } else if (req.method == "DELETE") {
      if (req.authenticatedUser) {
        const user = await UserModel.getByAuthenticationKey(
          req.authenticatedUser.authenticationKey
        );
        user.authenticationKey = null;
        await UserModel.update(user);

        res.status(200).json({ message: "Successfully Deauthenticated" });
      } else {
        res.status(401).json({
          message: "Please login to access the requested resource",
        });
      }
    }
  }

  /**
   *
   * Allows us to define restricted routes.
   * @param {Array<"admin" | "stock" | "sales"> | "any"} allowedRoles
   * @returns {express.RequestHandler}
   */
  static restrict(allowedRoles) {
    return function (req, res, next) {
      if (req.authenticatedUser) {
        if (
          allowedRoles == "any" ||
          allowedRoles.includes(req.authenticatedUser.role)
        ) {
          next();
        } else {
          res.status(403).json({
            message: "Access forbidden",
            errors: ["Role does not have access to the requested resource"],
          });
        }
      } else {
        res.status(401).json({
          message: "Not authenticated",
          errors: ["Please authenticate to access the requested resource"],
        });
      }
    };
  }
}
