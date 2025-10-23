import express from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/UserModel.mjs";
import { BlogController } from "./BlogController.mjs";
import { ValidationController } from "./ValidationController.mjs";

/**
 * This Controller handles the user authenticaiton process including logging in/out, restricting certain requests, etc
 */
export class AuthenticationController {
  static middleware = express.Router();
  static routes = express.Router();

  static {
    this.middleware.use(
      session({
        secret: "537b92ab-7d00-4745-89df-dc0c11c78bc6",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: "auto" },
      })
    );

    this.routes.get("/", this.viewAuthentication);
    this.routes.get("/signup", this.viewAuthenticationS);
    this.routes.get("/guest", this.handleGuest);
    this.routes.get("/logout", this.Deathenticate);
    this.routes.post("/:type", this.handleAuthentication);
  }

  /**
   * Renders the login page.
   *
   * @param {import("express").Request} req - Express request object
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends the rendered login view; does not return a value
   */
  static viewAuthentication(req, res) {
    res.render("login.ejs", {
      message: "Login",
    });
  }
  /**
   * Renders the signup page (login page with a different view/message).
   *
   * @param {import("express").Request} req - Express request object
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends the rendered signup view; does not return a value
   */
  static viewAuthenticationS(req, res) {
    res.render("login.ejs", {
      message: "Sign Up",
    });
  }
  /**
   * Handles user login or signup and manages session authentication.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} req.params.type - "l" for login, "s" for signup
   *   @param {string} req.body.username - Email input
   *   @param {string} [req.body.password] - Password input
   *   @param {string} [req.body.firstName] - First name for signup
   *   @param {string} [req.body.lastName] - Last name for signup
   *   @param {string} req.session.role - User role in session
   *   @param {string} req.session.loginId - Logged-in user ID in session
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a redirect or renders a response; does not return a value
   */
  static async handleAuthentication(req, res) {
    try {
      const contentType = req.get("Content-Type");
      const username = ValidationController.validateEmail(req.body.username);
      const password = ValidationController.validatePassword(req.body.password);
      if (contentType == "application/x-www-form-urlencoded") {
        if (req.params.type === "l") {
          try {
            const user = await UserModel.getByUsername(username);
            if (!user) {
              return res.status(401).render("status.ejs", {
                message: "Incorrect Password or Email",
                role: req.session.role,
              });
            }
            if (user.deleted === 1) {
              return res.status(500).render("status.ejs", {
                message: "Failed to Find User",
                role: req.session.role,
              });
            }
            const isCorrectPassword = await bcrypt.compare(
              password,
              user.password
            );
            console.log(isCorrectPassword);
            if (!isCorrectPassword) {
              return res.status(401).render("status.ejs", {
                message: "Incorrect Password or Email",
                role: req.session.role,
              });
            }
            console.log(user);
            req.session.loginId = user.id;
            req.session.role = user.role;
            return res.redirect("/blog");
          } catch (error) {
            return res
              .status(500)
              .render("status.ejs", { message: error, role: req.session.role });
          }
        } else if (req.params.type === "s") {
          try {
            const fName = ValidationController.validateName(req.body.firstName);
            const lName = ValidationController.validateName(req.body.lastName);
            const user = new UserModel(
              null,
              fName,
              lName,
              username,
              password,
              "member"
            );
            UserModel.create(user)
              .then((result) => {
                UserModel.getById(result.insertId)
                  .then((createdUser) => {
                    req.session.loginId = createdUser.id;
                    req.session.role = createdUser.role;
                    return res.redirect("/blog");
                  })
                  .catch((error) => {
                    return res.status(500).render("status.ejs", {
                      message: error,
                      role: req.session.role,
                    });
                  });
              })
              .catch((error) => {
                return res.status(500).render("status.ejs", {
                  message: error,
                  role: req.session.role,
                });
              });
          } catch (error) {
            return res.status(400).render("status.ejs", {
              message: "Invalid Credentials",
              role: req.session.role,
            });
          }
        }
      } else if (contentType == "application/json") {
        res.send("Invalid Content-Type");
      } else {
        res.send("Invalid Content-Type");
      }
    } catch (error) {
      return res.status(400).render("status.ejs", {
        message: "Invalid Credentials",
        role: req.session.role,
      });
    }
  }
  /**
   * Allows a guest user to access the app by assigning a guest role and redirecting to the blog.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} req.session.role - Session role to assign ("guest")
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a redirect; does not return a value
   */
  static handleGuest(req, res) {
    req.session.role = "guest";
    res.redirect("/blog");
  }

  /**
   * Destroys the current session and redirects the user to the login page.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} [req.session.role] - Current session role, if any
   *   @param {Function} req.session.destroy - Function to destroy the session
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a redirect; does not return a value
   */
  static Deathenticate(req, res) {
    if (req.session.role) {
      req.session.destroy();
    }
    res.status(200).redirect("/auth");
  }

  /**
   * Returns middleware that allows access only to users with specified roles, sending a 403 error otherwise.
   *
   * @param {string[]} allowedRoles - Array of roles allowed to access the resource
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} req.session.role - Session role of the current user
   * @param {import("express").Response} res - Express response object
   * @param {Function} next - Next middleware function
   * @returns {void} Calls next() if allowed, otherwise sends a 403 response
   */
  static restrict(allowedRoles) {
    return function (req, res, next) {
      if (allowedRoles.includes(req.session.role)) {
        next();
      } else {
        res.status(403).render("status.ejs", {
          message: "Role does not have access to the requested resource",
          role: req.session.role,
        });
      }
    };
  }
}
