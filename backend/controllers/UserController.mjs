import express from "express";
import { UserModel } from "../models/UserModel.mjs";
import { BookingController } from "./BookingController.mjs";
import { ValidationController } from "./ValidationController.mjs";
import { AuthenticationController } from "./Authentication.mjs";
import { SessionModel } from "../models/SessionModel.mjs";
import { BookingModel } from "../models/BookingModel.mjs";
/**
 * This class handles all User CRUD functions
 */
export class UserController {
  static routes = express.Router();

  static {
    this.routes.get(
      "/",
      AuthenticationController.restrict(["admin", "trainer"]),
      this.viewUserManage
    );

    this.routes.post(
      "/update",
      AuthenticationController.restrict(["admin"]),
      this.handleUpdateUser
    );
    this.routes.post(
      "/create",
      AuthenticationController.restrict(["admin"]),
      this.handleCreateUser
    );
    this.routes.get(
      "/delete",
      AuthenticationController.restrict(["admin"]),
      this.handleDeleteUser
    );
    this.routes.get(
      "/delete/:id",
      AuthenticationController.restrict(["admin"]),
      this.handleDeleteUser
    );
    this.routes.get(
      "/:id",
      AuthenticationController.restrict(["admin", "trainer"]),
      this.viewUserManage
    );
  }

  /**
   * Renders the User Management page with all users, optionally filtering by query parameters or URL parameters.
   *
   * @param {import("express").Request} req - Express request object containing:
   *   @param {Object} req.session - Session data
   *   @param {string} req.session.role - Current user's role
   *   @param {string} req.session.loginId - Current user's login ID
   *   @param {Object} req.query - Query parameters
   *   @param {string} [req.query.select] - Optional filter for user role selection
   *   @param {string} [req.query.search] - Optional search string for user filtering
   *   @param {string} [req.query.userId] - Optional user ID from query
   *   @param {Object} req.params - URL parameters
   *   @param {string} [req.params.id] - Optional user ID from URL parameter
   * @param {import("express").Response} res - Express response object used to render pages or send status
   * @returns {void} Sends a rendered page; does not return a value
   */
  static async viewUserManage(req, res) {
    const role = req.session.role;
    const loginId = req.session.loginId;
    const select = req.query.select ?? null;
    let userId;
    if (req.params.id) {
      userId = req.params.id;
    } else {
      userId = req.query.userId ?? null;
    }
    const search = req.query.search ?? null;
    let selectedUser = new UserModel(null, "", "", "", "", "");
    console.log("User Id " + userId);
    if (userId) {
      await UserModel.getById(userId)
        .then((result) => {
          console.log(result);
          selectedUser = result;
        })
        .catch((error) => {
          return res.status(500).render("status.ejs", {
            message: error,
            role: req.session.role,
          });
        });
    }
    UserModel.getAll()
      .then((users) => {
        console.log("Selected User: ");
        console.log(selectedUser);
        if (search) {
          users = users.filter(
            (user) =>
              (user.firstName &&
                user.firstName.toLowerCase().includes(search.toLowerCase())) ||
              (user.lastName &&
                user.lastName.toLowerCase().includes(search.toLowerCase())) ||
              (user.username &&
                user.username.toLowerCase().includes(search.toLowerCase()))
          );
        }
        if (select) {
          users = users.filter(
            (user) => user.role && user.role.toLowerCase() === "member"
          );
        }
        res.render("manage_members.ejs", {
          users,
          role,
          selectedUser,
          loginId,
          select,
          page: "user",
        });
      })
      .catch((error) => {
        return res.status(500).render("status.ejs", {
          message: error,
          role: req.session.role,
        });
      });
  }

  /**
   * Updates a user by ID using input from req.body, or redirects to deletion if requested.
   *
   * @param {import("express").Request} req - Express request object containing:
   *   @param {Object} req.body - Object containing user data for update
   *   @param {string} req.body.id - ID of the user to update
   *   @param {string} req.body.firstName - New first name for the user
   *   @param {string} req.body.lastName - New last name for the user
   *   @param {string} req.body.username - New email for the user
   *   @param {string} [req.body.password] - New password for the user (optional)
   *   @param {string} req.body.role - New role for the user
   *   @param {string} [req.body.action] - If "Delete User", triggers user deletion
   *   @param {string} req.session.role - Current user's role from session
   * @param {import("express").Response} res - Express response object used to redirect or render pages
   * @returns {void} Sends a redirect or renders a response; does not return a value
   */
  static async handleUpdateUser(req, res) {
    if (req.body.action === "Delete User") {
      console.log("deleting user with id " + req.body.id);
      return res.redirect("/users/delete/" + req.body.id);
    }
    try {
      const firstName = ValidationController.validateName(req.body.firstName);
      const lastName = ValidationController.validateName(req.body.lastName);
      const email = ValidationController.validateEmail(req.body.username);
      let password;
      const exisitngUser = await UserModel.getById(req.body.id);
      password = exisitngUser.password;

      if (req.body.password) {
        password = ValidationController.validatePassword(req.body.password);
      }
      const role = ValidationController.validateText(req.body.role);
      const id = req.body.id;

      const user = new UserModel(
        id,
        firstName,
        lastName,
        email,
        password,
        role
      );
      UserModel.update(user)
        .then(() => {
          res.redirect("/users");
        })
        .catch((error) => {
          res
            .status(500)
            .render("status.ejs", { message: error, role: req.session.role });
        });
    } catch (error) {
      res
        .status(400)
        .render("status.ejs", { message: error, role: req.session.role });
    }
  }

  /**
   * Creates a new user using data from the request body and redirects to the users page.
   * @param {import("express").Request} req - Express request object containing user input in req.body:
   *   @param {string} req.body.firstName - First name of the user.
   *   @param {string} req.body.lastName - Last name of the user.
   *   @param {string} req.body.username - Email/username of the user.
   *   @param {string} req.body.password - Password of the user.
   *   @param {string} req.body.role - Role assigned to the user.
   * @param {import("express").Response} res - Express response object used to send redirects or render error pages.
   * @returns {void} Sends a redirect or renders a response; does not return a value.
   */
  static handleCreateUser(req, res) {
    if (req.body.action === "Delete User") {
      return res.status(400).render("status.ejs", {
        role: req.session.role,
        message: "Cannot delete a new User",
      });
    }
    try {
      const firstName = ValidationController.validateName(req.body.firstName);
      const lastName = ValidationController.validateName(req.body.lastName);
      const username = ValidationController.validateEmail(req.body.username);
      const password = ValidationController.validatePassword(req.body.password);
      const role = ValidationController.validateText(req.body.role);
      const id = null;

      const user = new UserModel(
        id,
        firstName,
        lastName,
        username,
        password,
        role
      );
      UserModel.create(user)
        .then((result) => {
          return res.redirect("/users");
        })
        .catch((error) =>
          res.status(500).render("status.ejs", {
            message: error,
            role: req.session.role,
          })
        );
    } catch (error) {
      res.status(400).render("status.ejs", {
        message: error,
        role: req.session.role,
      });
    }
  }

  /**
   * Deletes a user by ID and removes all associated bookings, then redirects to the users page.
   * @param {import("express").Request} req - Express request object containing the user ID in req.params.id
   * @param {string} req.params.id - ID of the user to delete
   * @param {import("express").Response} res - Express response object used to send redirects or render error pages
   * @returns {void} Sends a redirect or renders a response; does not return a value
   */
  static async handleDeleteUser(req, res) {
    const id = req.params.id;
    console.log("this is the id " + id);

    if (!id) {
      return res.status(400).render("status.ejs", {
        message: "No User Selected",
        role: req.session.role,
      });
    }

    try {
      await BookingController.handleDeleteBookingByUser(id);
      await UserModel.delete(id);
      res.redirect("/users");
    } catch (error) {
      res.status(500).render("status.ejs", {
        message: error,
        role: req.session.role,
      });
    }
  }
  /**
   * Checks if a member is not already booked for a session at the same time, or if a trainer is not already busy during another session.
   * @param {string|number} userId - ID of the user or trainer to check availability for
   * @param {string} date - The date of the session in YYYY-MM-DD format
   * @param {string} startTime - The start time of the session in HH:MM format
   * @param {string} endTime - The end time of the session in HH:MM format
   * @param {string} type - Type of check: "booking" for members or "session" for trainers
   * @returns {Promise<boolean>} Returns true if the user is busy, false otherwise
   */
  static async checkUserIsntBusy(userId, date, startTime, endTime, type) {
    console.log(userId);
    console.log(date);
    console.log(startTime);
    console.log(endTime);
    const newStart = new Date(`${date}T${startTime}`);
    const newEnd = new Date(`${date}T${endTime}`);

    let items = null;
    let itemsOnDate = null;
    if (type === "booking") {
      items = await BookingModel.getAllOfUserId(userId);
      items = await BookingController.handleRetrieveFullBooking(items);
      itemsOnDate = items.filter((a) => a.session.date === date);
    } else {
      items = await SessionModel.getByUserId(userId);
      itemsOnDate = items.filter((a) => a.date === date);
    }

    for (const item of itemsOnDate) {
      let existingStart;
      let existingEnd;
      if (type === "booking") {
        console.log(item);
        existingStart = new Date(
          `${item.session.date}T${ValidationController.validateTime(
            item.session.startTime
          )}`
        );
        existingEnd = new Date(
          `${item.session.date}T${ValidationController.validateTime(
            item.session.endTime
          )}`
        );
      } else {
        existingStart = new Date(`${item.date}T${item.startTime}`);
        existingEnd = new Date(`${item.date}T${item.endTime}`);
      }
      if (newStart <= existingEnd && newEnd >= existingStart) {
        console.log("fail");
        return true;
      }
    }
    return false;
  }
}
// TESTING AREA

// UserModel.getAll().then((result) => {
//   console.log(result);
// });
