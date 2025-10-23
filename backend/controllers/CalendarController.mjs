import express from "express";
import { BookingModel } from "../models/BookingModel.mjs";
import { SessionModel } from "../models/SessionModel.mjs";
import { AuthenticationController } from "./Authentication.mjs";
import { UserController } from "./UserController.mjs";
import { SessionController } from "./SessionController.mjs";
import { ValidationController } from "./ValidationController.mjs";
/**
 * This class handles the calendar view and Create booking
 */
export class CalendarController {
  static routes = express.Router();

  static {
    this.routes.get(
      "/",
      AuthenticationController.restrict(["member", "guest"]),
      this.viewCalendar
    );
    this.routes.get(
      "/book/:id",
      AuthenticationController.restrict(["member", "admin"]),
      this.handleCreateBooking
    );
    this.routes.get(
      "/:year/:month/:date",
      AuthenticationController.restrict(["member", "guest"]),
      this.viewCalendar
    );
    this.routes.get(
      "/:year/:month/:date/:id",
      AuthenticationController.restrict(["member", "guest"]),
      this.viewCalendar
    );
  }

  /**
   * Renders the calendar view with all session data, optionally highlighting a selected date or session.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} [req.query.month] - Optional month number to view
   *   @param {string} [req.query.year] - Optional year to view
   *   @param {string} [req.params.date] - Optional specific date to highlight
   *   @param {string} [req.params.id] - Optional session ID to select
   *   @param {string} req.session.loginId - Logged-in user's ID
   *   @param {string} req.session.role - Logged-in user's role
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a rendered view; does not return a value
   */
  static viewCalendar(req, res) {
    const loginId = req.session.loginId;
    const role = req.session.role;
    const today = new Date();
    const month = parseInt(req.query.month) || today.getMonth();
    const year = parseInt(req.query.year) || today.getFullYear();
    let sessionsOfDate = [];
    let selectedDate = null;
    let selectedMonth = null;
    let selectedYear = null;
    let selectedDay = 0;
    let selectedSession = null;
    SessionModel.getAll()
      .then((result) => {
        const sessionDates = result.map((s) => {
          const d = new Date(s.date);
          return {
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            day: d.getDate(),
          };
        });
        if (req.params.date) {
          console.log(req.params.date);
          selectedMonth = Number(req.params.month);
          selectedYear = req.params.year;
          selectedDay = req.params.date;
          const rawDate = new Date(
            Date.UTC(req.params.year, selectedMonth, req.params.date)
          );
          selectedDate = rawDate.toISOString().split("T")[0];
          console.log(selectedDate);
          SessionModel.getByDate(selectedDate)
            .then((result) => {
              SessionController.getAllSessionData(result)
                .then((result) => {
                  sessionsOfDate = result;
                  if (req.params.id) {
                    SessionModel.getById(req.params.id)
                      .then((result) => {
                        SessionController.getAllSessionData(result)
                          .then((result) => {
                            selectedSession = result[0];
                            res.render("calendar.ejs", {
                              month,
                              year,
                              loginId,
                              role,
                              sessionsOfDate,
                              selectedDate,
                              selectedDay,
                              selectedSession,
                              sessionDates,
                              page: "cal",
                            });
                          })
                          .catch((error) => {
                            res.status(500).render("status.ejs", {
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
                  } else {
                    res.render("calendar.ejs", {
                      month,
                      year,
                      loginId,
                      role,
                      sessionsOfDate,
                      selectedDate,
                      selectedDay,
                      selectedSession,
                      sessionDates,
                      page: "cal",
                    });
                  }
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
        } else {
          res.render("calendar.ejs", {
            month,
            year,
            loginId,
            role,
            sessionsOfDate,
            selectedDate,
            selectedSession,
            selectedDay,
            sessionDates,
            page: "cal",
          });
        }
      })
      .catch((error) => {
        res
          .status(500)
          .render("status.ejs", { message: error, role: req.session.role });
      });
  }

  /**
   * Creates a booking for a session, either for the logged-in member or on behalf of a user by an admin.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} req.params.id - ID of the session to book
   *   @param {string} [req.query.admin] - Optional admin flag
   *   @param {string} [req.query.userId] - User ID if booking is created by an admin
   *   @param {string} req.session.loginId - ID of the logged-in member
   *   @param {string} req.session.role - Role of the logged-in user
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a redirect or renders a response; does not return a value
   */
  static async handleCreateBooking(req, res) {
    console.log("creating");
    const sessionId = req.params.id;
    if (sessionId === "null") {
      return res.status(400).render("status.ejs", {
        message: "No Session Selected",
        role: req.session.role,
      });
    }
    let loginId = req.session.loginId;
    let admin = null;
    if (req.query.admin) {
      admin = req.query.admin;
      loginId = req.query.userId;
    }
    const session = await SessionModel.getById(sessionId);
    const busy = await UserController.checkUserIsntBusy(
      loginId,
      session.date,
      ValidationController.validateTime(session.startTime),
      ValidationController.validateTime(session.endTime),
      "booking"
    );
    if (busy === true) {
      return res.status(409).render("status.ejs", {
        message: "Member already has a booking at that time",
        role: req.session.role,
      });
    }

    const newBooking = new BookingModel(null, sessionId, loginId);

    BookingModel.create(newBooking)
      .then((result) => {
        if (admin) {
          res.redirect("/bookings");
        } else {
          res.redirect("/calendar");
        }
      })
      .catch((error) => {
        return res
          .status(500)
          .render("status.ejs", { message: error, role: req.session.role });
      });
  }
}
