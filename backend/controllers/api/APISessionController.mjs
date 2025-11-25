import express from "express";
import { SessionModel } from "../../models/SessionModel.mjs";
import { APIAuthenticationController } from "./APIAuthenticationController.mjs";
import { DatabaseModel } from "../../models/DatabaseModel.mjs";
import { UserModel } from "../../models/UserModel.mjs";
import { LocationModel } from "../../models/LocationsModel.mjs";
import { ActivitiesModel } from "../../models/ActivitiesModel.mjs";
import { BookingModel } from "../../models/BookingModel.mjs";
export class APISessionController {
  static routes = express.Router();

  static {
    this.routes.get(
      "/",
      APIAuthenticationController.restrict("member"),
      this.getSessionsOfWeek
    );
    this.routes.get("/xml/:id", this.getSessionsXML);
    this.routes.get(
      "/:id",
      APIAuthenticationController.restrict("trainer"),
      this.getSessionByUserId
    );
    this.routes.delete(
      "/:id",
      APIAuthenticationController.restrict("trainer"),
      this.deleteSession
    );
  }

  /**
   * @type {express.RequestHandler}
   *
   *
   */
  static async getSessionsXML(req, res) {
    console.log("hit");
    try {
      const date = DatabaseModel.toMySqlDate(new Date());
      const sessions = await SessionModel.getByUserId(req.params.id);
      console.log("Sessions received:", sessions);

      if (!sessions || !Array.isArray(sessions)) {
        throw new Error("Sessions is not an array");
      }

      const fullSessions = await Promise.all(
        sessions.map(async (session) => {
          const trainer = await UserModel.getById(session.trainer);
          const location = await LocationModel.getById(session.location);
          const activity = await ActivitiesModel.getById(session.activity);
          return {
            ...session,
            trainer,
            location,
            activity,
          };
        })
      );

      console.log("fullSessions:", fullSessions);
      res
        .status(200)
        .contentType("text/xml")
        .render("session.xml.ejs", { sessions: fullSessions, date });
    } catch (error) {
      console.error("Full error details:", error);
      res.status(500).json({
        message: "Database Error - here",
        errors: [error.message],
        error: error.message,
      });
    }
  }
  static async getSessionsOfWeek(req, res) {
    try {
      const sessions = await SessionModel.getByStartAndEndDate(
        new Date(req.query.start_date),
        new Date(req.query.end_date)
      );

      console.log("here");
      console.log(sessions);

      const fullSessions = await Promise.all(
        sessions.map(async (session) => {
          const trainer = await UserModel.getById(session.trainer);
          const location = await LocationModel.getById(session.location);
          const activity = await ActivitiesModel.getById(session.activity);
          return {
            ...session,
            trainer,
            location,
            activity,
          };
        })
      );

      res.status(200).json(fullSessions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database error" });
    }
  }

  static async getSessions(req, res) {
    try {
      const allSessions = await SessionModel.getAll();
      res.status(200).json({ allSessions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }
  static async getSessionByUserId(req, res) {
    try {
      const sessions = await SessionModel.getByUserId(req.params.id);
      const fullSessions = await Promise.all(
        sessions.map(async (session) => {
          const trainer = await UserModel.getById(session.trainer);
          const location = await LocationModel.getById(session.location);
          const activity = await ActivitiesModel.getById(session.activity);
          return {
            ...session,
            trainer,
            location,
            activity,
          };
        })
      );

      res.status(200).json(fullSessions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }
  static async deleteSession(req, res) {
    try {
      const result = await BookingModel.getAllOfSessionId(req.params.id);
      const allBookings = Array.isArray(result) ? result : [];

      await Promise.all(
        allBookings.map((booking) => BookingModel.delete(booking.id))
      );
      const deleteResult = await SessionModel.delete(req.params.id);

      if (deleteResult.affectedRows === 1) {
        return res.status(200).json({ message: "Session Deleted" });
      } else {
        return res.status(404).json({
          message: "Not Found - The selected session could not be found",
        });
      }
    } catch (error) {
      console.error("Delete session error:", error);
      return res.status(500).json({ message: "Database Error" });
    }
  }
}
