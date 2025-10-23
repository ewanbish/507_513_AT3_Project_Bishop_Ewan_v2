import express from "express";
import { BookingModel } from "../models/BookingModel.mjs";
import { SessionModel } from "../models/SessionModel.mjs";
import { UserModel } from "../models/UserModel.mjs";
import { SessionController } from "./SessionController.mjs";
import { AuthenticationController } from "./Authentication.mjs";

/**
 * This Class handles all Booking CRUD related functions
 */
export class BookingController {
  static routes = express.Router();

  static {
    this.routes.get(
      "/",
      AuthenticationController.restrict(["trainer", "admin", "member"]),
      this.viewBookingManage
    );
    this.routes.get(
      "/delete/:id",
      AuthenticationController.restrict(["admin", "member"]),
      this.handleDeleteBooking
    );
    this.routes.get(
      "/update/:bookingId/:sessionId",
      AuthenticationController.restrict(["admin"]),
      this.handleUpdateBooking
    );
    this.routes.get(
      "/:id",
      AuthenticationController.restrict(["trainer", "admin", "member"]),
      this.viewBookingManage
    );
  }
  /**
   * Renders the manage bookings page with all bookings, filtered by user and search criteria.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} [req.params.id] - Booking ID from route parameters
   *   @param {string} [req.params.search] - Search query from route parameters
   *   @param {string} [req.query.bookingId] - Booking ID from query string
   *   @param {string} [req.query.userId] - User ID from query string (for filtering)
   *   @param {string} [req.query.search] - Search query from query string
   *   @param {string} req.session.role - Role of the logged-in user
   *   @param {string} req.session.loginId - ID of the logged-in user
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a rendered manage bookings view or error page; does not return a value
   */
  static async viewBookingManage(req, res) {
    const role = req.session.role;
    const loginId = req.session.loginId;
    let bookingId = null;
    if (req.query.bookingId) {
      bookingId = req.query.bookingId;
    } else {
      bookingId = req.params.id ?? null;
    }
    //  The following only allows for members to see their own booking info
    let userId = null;
    if (req.query.userId) {
      userId = req.query.userId;
      if (
        String(loginId) !== String(userId) &&
        req.session.role !== "admin" &&
        req.session.role !== "trainer"
      ) {
        return res.status(403).render("status.ejs", {
          message: "Invalid User Permissions",
          role: req.session.role,
        });
      }
    }

    if (bookingId) {
      const results = await BookingModel.getById(bookingId);
      if (
        String(loginId) !== String(results.userId) &&
        req.session.role !== "admin" &&
        req.session.role !== "trainer"
      ) {
        console.log(results);
        return res.status(403).render("status.ejs", {
          message: "Invalid User Permissions",
          role: req.session.role,
        });
      }
    }
    let search = null;
    if (req.query.search) {
      search = req.query.search;
    } else {
      search = req.params.search ?? null;
    }
    let selectedBooking = new BookingModel(null, null, null);
    BookingModel.getAll()
      .then((bookings) => {
        BookingController.handleRetrieveFullBooking(bookings)
          .then((fullBookings) => {
            fullBookings.sort(
              (a, b) => new Date(a.session.date) - new Date(b.session.date)
            );
            let filteredBookings = null;
            if (userId) {
              console.log("Caught here");
              const userBookings = fullBookings.filter(
                (booking) =>
                  booking.user.id &&
                  String(booking.user.id).toLowerCase() ===
                    String(userId).toLowerCase()
              );
              if (search) {
                if (
                  req.session.role === "admin" ||
                  req.session.role === "trainer"
                ) {
                  filteredBookings = userBookings.filter(
                    (booking) =>
                      (booking.user.firstName &&
                        booking.user.firstName
                          .toLowerCase()
                          .includes(search.toLowerCase())) ||
                      (booking.user.lastName &&
                        booking.user.lastName
                          .toLowerCase()
                          .includes(search.toLowerCase())) ||
                      (booking.user.username &&
                        booking.user.username
                          .toLowerCase()
                          .includes(search.toLowerCase())) ||
                      (booking.session.date &&
                        booking.session.date
                          .toLowerCase()
                          .includes(req.query.search.toLowerCase()))
                    // (booking.user.id &&
                    //   String(booking.user.id)
                    //     .toLowerCase()
                    //     .includes(search.toLowerCase()))
                  );
                }
              } else {
                filteredBookings = userBookings;
              }
            } else {
              if (search) {
                if (
                  req.session.role === "admin" ||
                  req.session.role === "trainer"
                ) {
                  filteredBookings = fullBookings.filter(
                    (booking) =>
                      (booking.user.firstName &&
                        booking.user.firstName
                          .toLowerCase()
                          .includes(search.toLowerCase())) ||
                      (booking.user.lastName &&
                        booking.user.lastName
                          .toLowerCase()
                          .includes(search.toLowerCase())) ||
                      (booking.user.username &&
                        booking.user.username
                          .toLowerCase()
                          .includes(search.toLowerCase())) ||
                      (booking.session.date &&
                        booking.session.date
                          .toLowerCase()
                          .includes(req.query.search.toLowerCase()))
                    // (booking.user.id &&
                    //   String(booking.user.id)
                    //     .toLowerCase()
                    //     .includes(search.toLowerCase()))
                  );
                }
              } else {
                filteredBookings = fullBookings;
              }
            }
            console.log("here are the bookings");
            console.log(filteredBookings[2]);
            if (bookingId) {
              BookingModel.getById(bookingId)
                .then((result) => {
                  selectedBooking = BookingController.handleRetrieveFullBooking(
                    result
                  )
                    .then((result) => {
                      selectedBooking = result[0];
                      if (search) {
                        res.render("manage_bookings.ejs", {
                          selectedBooking,
                          filteredBookings,
                          role,
                          loginId,
                          search: search,
                          userId,
                          page: "booking",
                        });
                      } else {
                        res.render("manage_bookings.ejs", {
                          selectedBooking,
                          filteredBookings,
                          role,
                          loginId,
                          search: null,
                          userId,
                          page: "booking",
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
              if (search) {
                res.render("manage_bookings.ejs", {
                  selectedBooking,
                  filteredBookings,
                  role,
                  loginId,
                  search: search,
                  userId,
                  page: "booking",
                });
              } else {
                res.render("manage_bookings.ejs", {
                  selectedBooking,
                  filteredBookings,
                  role,
                  loginId,
                  search: null,
                  userId,
                  page: "booking",
                });
              }
            }
          })
          .catch((error) => {
            return res
              .status(500)
              .render("status.ejs", { message: error, role: req.session.role });
          });
      })
      .catch((error) => {
        return res
          .status(500)
          .render("status.ejs", { message: error, role: req.session.role });
      });
  }

  /**
   * Retrieves full booking details including session and user data for one or multiple bookings.
   *
   * @param {Object|Object[]} bookings - A booking object or an array of booking objects, each containing:
   *   @param {string|number} bookings.sessionId - ID of the session for the booking
   *   @param {string|number} bookings.userId - ID of the user for the booking
   * @returns {Promise<Object[]>} Resolves to an array of bookings with session and user details
   */
  static async handleRetrieveFullBooking(bookings) {
    const allBookings = Array.isArray(bookings) ? bookings : [bookings];
    try {
      const fullBookings = await Promise.all(
        allBookings.map(async (booking) => {
          const sessionData = await SessionController.retrieveSessionForBooking(
            booking.sessionId
          );
          const userData = await UserModel.getById(booking.userId);
          return { ...booking, session: sessionData, user: userData };
        })
      );

      return fullBookings;
    } catch (error) {
      console.error(error);
    }
  }
  /**
   * Updates a booking by ID with a new session and redirects or renders an error page.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} req.params.bookingId - ID of the booking to update
   *   @param {string} req.params.sessionId - ID of the new session
   *   @param {string} req.session.role - Role of the logged-in user
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a redirect or renders an error page; does not return a value
   */
  static handleUpdateBooking(req, res) {
    console.log("updating");
    const bookingId = req.params.bookingId;
    const sessionId = req.params.sessionId;
    if (sessionId === "null") {
      return res.status(400).render("status.ejs", {
        message: "No Session Selected",
        role: req.session.role,
      });
    }
    BookingModel.update(sessionId, bookingId)
      .then((result) => {
        res.redirect("/bookings");
      })
      .catch((error) => {
        res
          .status(500)
          .render("status.ejs", { message: error, role: req.session.role });
      });
  }
  /**
   * Deletes a booking by ID and redirects to the bookings page, optionally filtered by user.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} req.params.id - ID of the booking to delete
   *   @param {string} [req.query.userId] - Optional user ID for filtering the redirect
   *   @param {string} req.session.role - Role of the logged-in user
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a redirect or renders an error page; does not return a value
   */
  static handleDeleteBooking(req, res) {
    const id = req.params.id;
    let userId = null;
    if (req.query.userId) {
      userId = req.query.userId;
    }
    if (id) {
      BookingModel.delete(id)
        .then((result) => {
          if (userId) {
            return res.redirect("/bookings?userId=" + userId);
          } else {
            return res.redirect("/bookings");
          }
        })
        .catch((error) => {
          return res
            .status(500)
            .render("status.ejs", { message: error, role: req.session.role });
        });
    } else {
      res.status(400).render("status.ejs", {
        message: "No Booking Selected",
        role: req.session.role,
      });
    }
  }

  /**
   * Deletes all bookings associated with a given session ID.
   *
   * @param {string|number} id - ID of the session whose bookings should be deleted
   * @throws {Error} Throws an error if retrieval or deletion of bookings fails
   * @returns {void} Does not return a value
   */
  static async handleDeleteBookingBySession(id) {
    try {
      const result = await BookingModel.getAllOfSessionId(id);
      const allSessions = Array.isArray(result) ? result : [result];
      await Promise.all(
        allSessions.map((session) => SessionModel.delete(session.id))
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes all bookings associated with a given user ID.
   *
   * @param {string|number} id - ID of the user whose bookings should be deleted
   * @throws {Error} Throws an error if retrieval or deletion of bookings fails
   * @returns {void} Does not return a value
   */
  static async handleDeleteBookingByUser(id) {
    try {
      const result = await BookingModel.getAllOfUserId(id);
      const allBookings = Array.isArray(result) ? result : [result];
      await Promise.all(
        allBookings.map((booking) => BookingModel.delete(booking.id))
      );
    } catch (error) {
      throw error;
    }
  }
}
