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
   * /api/session/xml/{id}:
   *   get:
   *     summary: "Export a certain trainers sessions to XML"
   *     tags: [Sessions]
   *     security:
   *       - ApiKeyAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       "200":
   *         description: "Complete sessions XML"
   *         content:
   *           text/xml:
   *             schema:
   *               type: array
   *               xml:
   *                 name: sessions
   *               items:
   *                 type: object
   *                 properties:
   *                   date:
   *                     type: string
   *                     format: date
   *                   start-time:
   *                     type: string
   *                     format: time
   *                   end-time:
   *                     type: string
   *                     format: time
   *                   trainer:
   *                     type: object
   *                     properties:
   *                       email:
   *                         type: string
   *                         example: jane@doe.mail
   *                       first-name:
   *                         type: string
   *                         example: Jane
   *                       last-name:
   *                         type: string
   *                         example: Doe
   *                   activity-name:
   *                     type: string
   *                     example: Pilates
   *                   location-name:
   *                     type: string
   *                     example: Chermside
   *       "404":
   *         $ref: "#/components/responses/Not_Found"
   *       "500":
   *         $ref: "#/components/responses/Database_Error"
   *       default:
   *         $ref: "#/components/responses/Database_Error"
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

  /**
   *
   * @openapi
   * /api/session:
   *   get:
   *     summary: "Get all sessions from the database"
   *     tags: [Sessions]
   *     security:
   *       - ApiKeyAuth: []
   *     parameters:
   *       - in: query
   *         name: start_date
   *         schema:
   *           type: string
   *           format: date
   *         required: false
   *         description: "Start date filter (YYYY-MM-DD)"
   *       - in: query
   *         name: end_date
   *         schema:
   *           type: string
   *           format: date
   *         required: false
   *         description: "End date filter (YYYY-MM-DD)"
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/Retrieved_Array"
   *       "500":
   *         $ref: "#/components/responses/Database_Error"
   *       "401":
   *         $ref: "#/components/responses/Not_Authenticated"
   *       "403":
   *         $ref: "#/components/responses/Forbidden"
   *       default:
   *         $ref: "#/components/responses/Database_Error"
   */
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

  /**
   *
   * @openapi
   * /api/session/{id}:
   *   get:
   *     summary: "Get sessions by a user's id"
   *     tags: [Sessions]
   *     security:
   *       - ApiKeyAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/Retrieved_Array"
   *       "404":
   *         $ref: "#/components/responses/Not_Found"
   *       "500":
   *         $ref: "#/components/responses/Database_Error"
   *       "401":
   *         $ref: "#/components/responses/Not_Authenticated"
   *       "403":
   *         $ref: "#/components/responses/Forbidden"
   *       default:
   *         $ref: "#/components/responses/Database_Error"
   */
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
  /**
   *
   * @openapi
   * /api/session/{id}:
   *   delete:
   *     summary: "Delete a specific Session from the database"
   *     tags: [Sessions]
   *     security:
   *       - ApiKeyAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         $ref: "#/components/responses/Deleted"
   *       404:
   *         $ref: "#/components/responses/Not_Found"
   *       500:
   *         $ref: "#/components/responses/Database_Error"
   *       "401":
   *         $ref: "#/components/responses/Not_Authenticated"
   *       "403":
   *         $ref: "#/components/responses/Forbidden"
   *       default:
   *         $ref: "#/components/responses/Database_Error"
   */
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
