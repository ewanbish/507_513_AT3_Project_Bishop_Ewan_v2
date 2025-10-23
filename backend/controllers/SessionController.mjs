import express from "express";
import { SessionModel } from "../models/SessionModel.mjs";
import { BookingController } from "./BookingController.mjs";
import { ValidationController } from "./ValidationController.mjs";
import { LocationModel } from "../models/LocationsModel.mjs";
import { ActivitiesModel } from "../models/ActivitiesModel.mjs";
import { UserModel } from "../models/UserModel.mjs";
import { AuthenticationController } from "./Authentication.mjs";
import { UserController } from "./UserController.mjs";
/**
 * This class handles all session CRUD functions
 */
export class SessionController {
  static routes = express.Router();

  static {
    this.routes.get(
      "/",
      AuthenticationController.restrict(["admin", "trainer"]),
      this.viewSessionManage
    );
    // this.routes.get("/select", AuthenticationController.restrict(["admin", "trainer"]), this.handle)
    this.routes.post(
      "/update",
      AuthenticationController.restrict(["admin", "trainer"]),
      this.verifyUser(),
      this.handleUpdateSession
    );
    this.routes.post(
      "/create",
      AuthenticationController.restrict(["admin", "trainer"]),
      this.handleCreateSession
    );
    this.routes.post(
      "/delete",
      AuthenticationController.restrict(["admin", "trainer"]),
      this.verifyUser(),
      this.handleDeleteSession
    );
    this.routes.post(
      "/delete/:id",
      AuthenticationController.restrict(["admin", "trainer"]),
      this.verifyUser(),
      this.handleDeleteSession
    );
    // this.routes.post("/query", this.handleSearchQuery);
    this.routes.get(
      "/:id",
      AuthenticationController.restrict(["admin", "trainer"]),
      this.viewSessionManage
    );
  }

  /**
   * This function will restrict trainers to only access their own sessions
   * @returns {void} Returns an error response if user is unathorised
   */
  static verifyUser() {
    return function (req, res, next) {
      const TrainerId = req.session.loginId;
      let idToCheck = null;
      if (req.body && req.body.trainer) {
        idToCheck = req.body.trainer;
      }
      console.log("here");
      console.log(TrainerId);
      console.log(idToCheck);
      if (
        String(TrainerId) !== String(idToCheck) &&
        req.session.role !== "admin"
      ) {
        return res.status(403).render("status.ejs", {
          message: "User does not have access to the requested resource",
          role: req.session.role,
        });
      } else {
        next();
      }
    };
  }

  /**
   * Renders the session management page with all sessions, activities, locations, trainers, and optional search/booking filters.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} [req.query.sessionId] - Optional session ID to pre-select
   *   @param {string} [req.params.id] - Optional session ID from route params
   *   @param {string} [req.query.userId] - Optional user ID to filter bookings
   *   @param {string} [req.query.bookingId] - Optional booking ID for reference
   *   @param {string} [req.query.search] - Optional search string to filter sessions
   *   @param {string} req.session.role - Logged-in user's role
   *   @param {string} req.session.loginId - Logged-in user's ID
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a rendered page or error response; does not return a value
   */
  static viewSessionManage(req, res) {
    const loginId = req.session.loginId;
    const role = req.session.role;
    let sessionId = null;
    if (req.query.sessionId) {
      sessionId = req.query.sessionId;
    } else {
      sessionId = req.params.id ?? null;
    }
    let userId = null;
    let userName = null;
    let bookingId = null;
    if (req.query.userId) {
      userId = req.query.userId;
      UserModel.getById(userId)
        .then((results) => {
          userName = results.firstName;
        })
        .catch((error) => {
          return res
            .status(500)
            .render("status.ejs", { message: error, role: req.session.role });
        });
      bookingId = req.query.bookingId;
    }
    console.log("this is the booking id " + bookingId);
    let selectedSession = new SessionModel(null, "", "", "", "", "", "");
    let allActivities = [];
    let allLocations = [];
    let allTrainers = [];
    if (req.query.search) {
      SessionModel.getAll()
        .then((sessions) => {
          SessionController.getAllSessionData(sessions).then((fullSessions) => {
            fullSessions = fullSessions.filter(
              (session) =>
                (session.trainer &&
                  session.trainer.firstName
                    .toLowerCase()
                    .includes(req.query.search.toLowerCase())) ||
                (session.date &&
                  session.date
                    .toLowerCase()
                    .includes(req.query.search.toLowerCase())) ||
                (session.activity &&
                  session.activity.activity_name
                    .toLowerCase()
                    .includes(req.query.search.toLowerCase()))
            );
            if (req.session.role === "trainer") {
              fullSessions = fullSessions.filter(
                (session) =>
                  session.trainer &&
                  String(session.trainer.id) === String(req.session.loginId)
              );
            }
            LocationModel.getAll()
              .then((result) => {
                allLocations = result;
                ActivitiesModel.getAll()
                  .then((result) => {
                    allActivities = result;
                    UserModel.getAll()
                      .then((result) => {
                        allTrainers = result.filter(
                          (trainer) => trainer.role === "trainer"
                        );
                        if (sessionId) {
                          SessionModel.getById(sessionId)
                            .then((result) => {
                              SessionController.getAllSessionData(result)
                                .then((fullSelectedSession) => {
                                  selectedSession = fullSelectedSession[0];
                                  res.render("manage_sessions.ejs", {
                                    fullSessions,
                                    role,
                                    selectedSession,
                                    loginId,
                                    allLocations,
                                    allActivities,
                                    allTrainers,
                                    search: req.query.search,
                                    userId,
                                    userName,
                                    bookingId,
                                    page: "session",
                                  });
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
                          res.render("manage_sessions.ejs", {
                            fullSessions,
                            role,
                            selectedSession,
                            loginId,
                            allLocations,
                            allActivities,
                            allTrainers,
                            search: req.query.search,
                            userId,
                            userName,
                            bookingId,
                            page: "session",
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
              })
              .catch((error) => {
                return res.status(500).render("status.ejs", {
                  message: error,
                  role: req.session.role,
                });
              });
          });
        })
        .catch((error) => {
          return res
            .status(500)
            .render("status.ejs", { message: error, role: req.session.role });
        });
    } else {
      SessionModel.getAll()
        .then((sessions) => {
          SessionController.getAllSessionData(sessions)
            .then((fullSessions) => {
              if (req.session.role === "trainer") {
                fullSessions = fullSessions.filter(
                  (session) =>
                    session.trainer &&
                    String(session.trainer.id) === String(req.session.loginId)
                );
              }
              LocationModel.getAll()
                .then((result) => {
                  allLocations = result;
                  ActivitiesModel.getAll()
                    .then((result) => {
                      allActivities = result;
                      UserModel.getAll()
                        .then((result) => {
                          allTrainers = result.filter(
                            (trainer) => trainer.role === "trainer"
                          );
                          if (sessionId) {
                            SessionModel.getById(sessionId)
                              .then((result) => {
                                SessionController.getAllSessionData(result)
                                  .then((fullSelectedSession) => {
                                    selectedSession = fullSelectedSession[0];

                                    res.render("manage_sessions.ejs", {
                                      fullSessions,
                                      role,
                                      selectedSession,
                                      loginId,
                                      allLocations,
                                      allActivities,
                                      allTrainers,
                                      search: null,
                                      userId,
                                      userName,
                                      bookingId,
                                      page: "session",
                                    });
                                  })
                                  .catch((error) => {
                                    return res
                                      .status(500)
                                      .render("status.ejs", {
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
                            res.render("manage_sessions.ejs", {
                              fullSessions,
                              role,
                              selectedSession,
                              loginId,
                              allLocations,
                              allActivities,
                              allTrainers,
                              search: null,
                              userId,
                              userName,
                              bookingId,
                              page: "session",
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
        })
        .catch((error) => {
          return res
            .status(500)
            .render("status.ejs", { message: error, role: req.session.role });
        });
    }
  }
  /**
   * Updates a session by ID using request body input or redirects to delete if requested.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} [req.body.id] - ID of the session to update
   *   @param {string} req.body.activity - Activity ID for the session
   *   @param {string} req.body.trainer - Trainer ID for the session
   *   @param {string} req.body.location - Location ID for the session
   *   @param {string} req.body.date - Date for the session
   *   @param {string} req.body.startTime - Start time for the session
   *   @param {string} req.body.endTime - End time for the session
   *   @param {string} req.body.action - Action to perform ("Delete Session" triggers redirect)
   *   @param {string} req.session.role - Logged-in user's role
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a redirect or renders a page; does not return a value
   */
  static async handleUpdateSession(req, res) {
    if (req.body.action === "Delete Session") {
      try {
        const verify = SessionController.verifyUser();

        return verify(req, res, async () => {
          req.params.id = req.body.id;
          await SessionController.handleDeleteSession(req, res);
        });
      } catch (err) {
        console.error("Error deleting session:", err);
        return res.status(500).send("Internal server error");
      }
    }
    try {
      const startTime = ValidationController.validateTime(req.body.startTime);
      const endTime = ValidationController.validateTime(req.body.endTime);

      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);

      if (end <= start) {
        return res.status(400).render("status.ejs", {
          message: "End Time cannot be before Start Time",
          role: req.session.role,
        });
      }

      if (req.session.role === "trainer") {
        if (req.body.trainer !== req.session.loginId) {
          return res.status(400).render("status.ejs", {
            message: "Cannot create session for other trainers",
            role: req.session.role,
          });
        }
      }

      const session = new SessionModel(
        req.body.id,
        req.body.activity,
        req.body.trainer,
        req.body.location,
        ValidationController.validateDate(req.body.date),
        ValidationController.validateTime(req.body.startTime),
        ValidationController.validateTime(req.body.endTime)
      );

      SessionModel.update(session)
        .then((result) => {
          return res.redirect("/session");
        })
        .catch((error) => {
          return res
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
   * Creates a new session using request body input, validating times and checking trainer availability.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} req.body.activity - Activity ID for the session
   *   @param {string} req.body.trainer - Trainer ID for the session
   *   @param {string} req.body.location - Location ID for the session
   *   @param {string} req.body.date - Date of the session
   *   @param {string} req.body.startTime - Start time of the session
   *   @param {string} req.body.endTime - End time of the session
   *   @param {string} req.body.action - Action to perform ("Delete Session" triggers error)
   *   @param {string} req.session.role - Logged-in user's role
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a redirect or renders a page; does not return a value
   */
  static async handleCreateSession(req, res) {
    if (req.body.action === "Delete Session") {
      return res.status(400).render("status.ejs", {
        role: req.session.role,
        message: "Cannot delete a new Session",
      });
    }
    try {
      const startTime = ValidationController.validateTime(req.body.startTime);
      const endTime = ValidationController.validateTime(req.body.endTime);

      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);

      if (end <= start) {
        return res.status(400).render("status.ejs", {
          message: "End Time cannot be before Start Time",
          role: req.session.role,
        });
      }

      if (req.session.role === "trainer") {
        if (req.body.trainer !== req.session.loginId) {
          return res.status(400).render("status.ejs", {
            message: "Cannot create session for other trainers",
            role: req.session.role,
          });
        }
      }

      const session = new SessionModel(
        null,
        req.body.activity,
        req.body.trainer,
        req.body.location,
        ValidationController.validateDate(req.body.date),
        startTime,
        endTime
      );

      const busy = await UserController.checkUserIsntBusy(
        session.trainer,
        session.date,
        session.startTime,
        session.endTime,
        "session"
      );

      if (busy === true) {
        return res.status(409).render("status.ejs", {
          message: "Trainer already has a session at that time",
          role: req.session.role,
        });
      }
      await SessionModel.create(session);

      return res.redirect("/session");
    } catch (error) {
      console.error(error);
      return res.status(500).render("status.ejs", {
        message: error,
        role: req.session.role,
      });
    }
  }
  /**
   * Deletes a session by ID and removes all associated bookings.
   *
   * @param {import("express").Request} req - Express request object
   * @param {string} req.params.id - ID of the session to delete
   * @param {string} req.session.role - Role of the logged-in user
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a redirect or renders a status page; does not return a value
   */
  static async handleDeleteSession(req, res) {
    const id = req.params.id;

    if (!id) {
      return res.status(400).render("status.ejs", {
        message: "No Session Selected",
        role: req.session.role,
      });
    }
    try {
      await BookingController.handleDeleteBookingBySession(id);
      await SessionModel.delete(id);
      res.redirect("/session");
    } catch (error) {
      console.error(error);
      res.status(500).render("status.ejs", {
        message: error.message || error,
        role: req.session.role,
      });
    }
  }
  /**
   * Retrieves all session data, including location, activity, and trainer information.
   *
   * @param {Object|Object[]} sessions - A session object or an array of session objects.
   * @param {string|number} sessions[].location - Location ID of the session
   * @param {string|number} sessions[].activity - Activity ID of the session
   * @param {string|number} sessions[].trainer - Trainer ID of the session
   * @returns {Promise<Object[]>} A promise that resolves to an array of enriched session objects
   */
  static async getAllSessionData(sessions) {
    const allSessions = Array.isArray(sessions) ? sessions : [sessions];
    try {
      const fullSessions = await Promise.all(
        allSessions.map(async (session) => {
          let locationData = await LocationModel.getById(session.location);
          if (!locationData) {
            locationData = new LocationModel(
              null,
              "Error: Delete This location"
            );
          }
          const activityData = await ActivitiesModel.getById(session.activity);
          const trainerData = await UserModel.getById(session.trainer);
          return {
            ...session,
            location: locationData,
            activity: activityData,
            trainer: trainerData,
          };
        })
      );
      return fullSessions;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves session data by ID and returns the full session object.
   *
   * @param {string|number} id - The ID of the session to retrieve.
   * @returns {Promise<Object>} A promise that resolves to the full session object.
   * @throws {Error} If retrieval or processing fails.
   */
  static async retrieveSessionForBooking(id) {
    try {
      const session = await SessionModel.getById(id);
      const fullSessionArray = await SessionController.getAllSessionData(
        session
      );
      return fullSessionArray[0];
    } catch (error) {
      throw error; // Let the caller handle the error
    }
  }
}
