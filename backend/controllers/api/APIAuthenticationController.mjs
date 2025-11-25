import express from "express";
import { UserModel } from "../../models/UserModel.mjs";
import bcrypt from "bcryptjs";

export class APIAuthenticationController {
  static middleware = express.Router();
  static routes = express.Router();

  static {
    this.middleware.use(this.#APIAuthenticationProvider);
    this.routes.post("/authenticate/register", this.handleRegister);
    this.routes.post("/authenticate", this.handleAuthenticate);
    this.routes.delete(
      "/authenticate",
      this.restrict("any"),
      this.handleAuthenticate
    );
    this.routes.get("/authenticate/resume", this.handleResume);
  }

  /**
   *
   * @private
   * @type {express.RequestHandler}
   */
  static async #APIAuthenticationProvider(req, res, next) {
    console.log("The API Authentication has been called");
    console.log(
      "This is the auth key from the req header " + req.headers["x-auth-key"]
    );
    const authenticationKey = req.headers["x-auth-key"];
    if (authenticationKey) {
      console.log("successful");
      try {
        req.authenticatedUser = await UserModel.getByAuthenticationKey(
          authenticationKey
        );
      } catch (error) {
        console.log("Not working");
      }
    }
    next();
  }

  /**
   *
   * @openapi
   * /api/authenticate/resume:
   *   get:
   *     summary: "Retrieve the user using auth-key"
   *     tags: [Authentication]
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/Retrieved"
   *       "500":
   *         $ref: "#/components/responses/Not_Authenticated"
   *       default:
   *         $ref: "#/components/responses/Database_Error"
   */
  static async handleResume(req, res) {
    console.log("yooo");
    const authenticationKey = req.headers["x-auth-key"];
    try {
      const result = await UserModel.getByAuthenticationKey(authenticationKey);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Please login" });
    }
  }
  /**
   *
   * @type {express.RequestHandler}
   * @openapi
   * /api/authenticate:
   *   post:
   *     summary: "Send user credentials to server - to authenticate"
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/UserCredentials"
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/Authenticated"
   *       "500":
   *         $ref: "#/components/responses/Database_Error"
   *       "400":
   *         $ref: "#/components/responses/Invalid_Credentials"
   *       default:
   *         $ref: "#/components/responses/Database_Error"
   *   delete:
   *     summary: "Log out a user - Deauthenticate"
   *     tags: [Authentication]
   *     security:
   *       - ApiKeyAuth: []
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/Deleted"
   *       "401":
   *         $ref: "#/components/responses/Not_Authenticated"
   *       "500":
   *         $ref: "#/components/responses/Database_Error"
   *       default:
   *         $ref: "#/components/responses/Database_Error"
   */

  static async handleAuthenticate(req, res) {
    if (req.method == "POST") {
      try {
        console.log("Authenticating...");
        const user = await UserModel.getByUsername(req.body.email);
        console.log(user);
        console.log(req.body.password);
        if (await bcrypt.compare(req.body.password, user.password)) {
          console.log("sucess");
          const authenticationKey = crypto.randomUUID();
          user.password = req.body.password;
          user.authenticationKey = authenticationKey;
          console.log(user);
          await UserModel.update(user);
          res.status(200).json({
            message: "Successfully authenticated",
            key: user.authenticationKey,
            user: user,
          });
        } else {
          console.log("fail");
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
   * @openapi
   * /api/authenticate/register:
   *   post:
   *     summary: "Register a new user"
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/User"
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/Authenticated"
   *       default:
   *         $ref: "#/components/responses/Database_Error"
   */
  static async handleRegister(req, res) {
    console.log("Registering...");
    try {
      const user = new UserModel(
        req.body.id,
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        req.body.password,
        req.body.role,
        null
      );
      const result = await UserModel.create(user);
      user.id = result.insertId;
      const authenticationKey = crypto.randomUUID();
      user.authenticationKey = authenticationKey;
      await UserModel.update(user);
      res.status(200).json({
        message: "Successfully authenticated",
        key: user.authenticationKey,
        user: user,
      });
    } catch (error) {
      switch (error) {
        case "not found":
          res.status(400).json({ message: "Invalid credentials" });
          break;
        default:
          console.error(error);
          res.status(500).json({ message: "Failed to register user" });
          break;
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
        console.log("caught here");
        res.status(401).json({
          message: "Not authenticated",
          errors: ["Please authenticate to access the requested resource"],
        });
      }
    };
  }
}
// const user = new UserModel(
//   5,
//   "Ewan",
//   "Bishop",
//   "ewanb@gmail.com",
//   "Password1*",
//   "admin"
// );
// UserModel.update(user);
