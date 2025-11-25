import express from "express";
import { BookingModel } from "../../models/BookingModel.mjs";
import { UserModel } from "../../models/UserModel.mjs";
import { SessionModel } from "../../models/SessionModel.mjs";
import { APIAuthenticationController } from "./APIAuthenticationController.mjs";
import { ActivitiesModel } from "../../models/ActivitiesModel.mjs";
import { LocationModel } from "../../models/LocationsModel.mjs";
import { DatabaseModel } from "../../models/DatabaseModel.mjs";
export class APIBookingController {
  static routes = express.Router();

  static {
    this.routes.get(
      "/",
      APIAuthenticationController.restrict("member"),
      this.getBookings
    );
    this.routes.post(
      "/",
      APIAuthenticationController.restrict("member"),
      this.createBooking
    );
    this.routes.get(
      "/xml/:id",
      APIAuthenticationController.restrict("member"),
      this.getBookingsXML
    );
    this.routes.get(
      "/:id",
      APIAuthenticationController.restrict("member"),
      this.getBookingByUserId
    );
    this.routes.delete(
      "/:id",
      APIAuthenticationController.restrict("member"),
      this.deleteBooking
    );
  }

  /**
   *
   * @openapi
   * /api/booking/xml/{id}:
   *   get:
   *     summary: "Export a certain users bookings to XML"
   *     tags: [Bookings]
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
   *         description: "Complete bookings XML"
   *         content:
   *           text/xml:
   *             schema:
   *               type: array
   *               xml:
   *                 name: bookings
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                     example: 1
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
   *       "401":
   *         $ref: "#/components/responses/Not_Authenticated"
   *       "403":
   *         $ref: "#/components/responses/Forbidden"
   *       default:
   *         $ref: "#/components/responses/Generic_Error"
   */
  static async getBookingsXML(req, res) {
    try {
      const date = DatabaseModel.toMySqlDate(new Date());
      const bookings = await BookingModel.getBookingsXML(req.params.id);

      const fullBookings = await Promise.all(
        bookings.map(async (booking) => {
          try {
            const user = await UserModel.getById(booking.userId);
            const session = await SessionModel.getByIdForXML(booking.sessionId);
            const trainer = await UserModel.getByIdForXML(session.trainer);
            const location = await LocationModel.getByIdForXML(
              session.location
            );
            const activity = await ActivitiesModel.getByIdForXML(
              session.activity
            );

            return {
              ...booking,
              user,
              session: {
                ...session,
                trainer,
                location,
                activity,
              },
            };
          } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Database error" });
          }
        })
      );
      res
        .status(200)
        .contentType("text/xml")
        .render("booking.xml.ejs", { bookings: fullBookings, date });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Database error" });
    }
  }
  /**
   *
   * @param {*} req
   * @param {*} res
   * @type {express.RequestHandler}
   * @openapi
   * /api/booking:
   *   get:
   *     summary: "Get all bookings from database"
   *     tags: [Bookings]
   *     security:
   *       - ApiKeyAuth: []
   *     parameters:
   *       - name: filter
   *         in: query
   *         description: Search filter on Blog titles, content and authors.
   *         required: false
   *         schema:
   *           type: string
   *           example: "Push"
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
   *         $ref: "#/components/responses/Generic_Error"
   */
  static async getBookings(req, res) {
    try {
      const allBookings = await BookingModel.getAll();

      const fullBookings = await Promise.all(
        allBookings.map(async (booking) => {
          try {
            const user = await UserModel.getById(booking.userId);
            const session = await SessionModel.getById(booking.sessionId);
            const trainer = await UserModel.getById(session.trainer);
            const location = await LocationModel.getById(session.location);
            const activity = await ActivitiesModel.getById(session.activity);

            return {
              ...booking,
              user,
              session: {
                ...session,
                trainer,
                location,
                activity,
              },
            };
          } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Database error" });
          }
        })
      );
      if (req.query.filter) {
        const query = req.query.filter.toLowerCase();
        const filtered = fullBookings.filter((booking) => {
          return (
            booking.session.activity.activity_name
              ?.toLowerCase()
              .includes(query) ||
            booking.session.trainer.firstName?.toLowerCase().includes(query) ||
            booking.session.trainer.lastName?.toLowerCase().includes(query) ||
            booking.session.date?.toLowerCase().includes(query) ||
            booking.session.location.location_name
              ?.toLowerCase()
              .includes(query)
          );
        });

        return res.status(200).json(filtered);
      }
      res.status(200).json(fullBookings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }

  /**
   *
   * @openapi
   * /api/booking/{id}:
   *   get:
   *     summary: "Get a users bookings from the database"
   *     tags: [Bookings]
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
   *         $ref: "#/components/responses/Generic_Error"
   */
  static async getBookingByUserId(req, res) {
    try {
      const allBookings = await BookingModel.getAllOfUserId(req.params.id);

      const fullBookings = await Promise.all(
        allBookings.map(async (booking) => {
          try {
            const user = await UserModel.getById(booking.userId);
            const session = await SessionModel.getById(booking.sessionId);
            const trainer = await UserModel.getById(session.trainer);
            const location = await LocationModel.getById(session.location);
            const activity = await ActivitiesModel.getById(session.activity);

            return {
              ...booking,
              user,
              session: {
                ...session,
                trainer,
                location,
                activity,
              },
            };
          } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Database error" });
          }
        })
      );
      res.status(200).json(fullBookings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }
  /**
   *
   * @openapi
   * /api/booking/{id}:
   *   delete:
   *     summary: "Delete a specific booking from the database"
   *     tags: [Bookings]
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
   *         $ref: "#/components/responses/Deleted"
   *       "404":
   *         $ref: "#/components/responses/Not_Found"
   *       "500":
   *         $ref: "#/components/responses/Database_Error"
   *       "401":
   *         $ref: "#/components/responses/Not_Authenticated"
   *       "403":
   *         $ref: "#/components/responses/Forbidden"
   *       default:
   *         $ref: "#/components/responses/Generic_Error"
   */
  static async deleteBooking(req, res) {
    try {
      const result = await BookingModel.delete(req.params.id);
      if (result.affectedRows == 1) {
        res.status(200).json({
          message: "Booking Deleted",
        });
      } else {
        res.status(404).json({
          message: "Not Found - The selected booking could not be found",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }
  /**
   *
   * @openapi
   * /api/booking:
   *   post:
   *     summary: "Create a new booking"
   *     tags: [Bookings]
   *     security:
   *       - ApiKeyAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/Booking"
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/Created"
   *       400:
   *         description: "The resource already exists"
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               required: [message]
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Resource Updated"
   *       "500":
   *         $ref: "#/components/responses/Database_Error"
   *       "401":
   *         $ref: "#/components/responses/Not_Authenticated"
   *       "403":
   *         $ref: "#/components/responses/Forbidden"
   *       default:
   *         $ref: "#/components/responses/Generic_Error"
   */
  static async createBooking(req, res) {
    try {
      const booking = new BookingModel(
        null,
        req.body.sessionId,
        req.body.userId
      );
      const check = await BookingModel.getAllOfUserId(req.body.userId);

      for (const session of check) {
        if (session.sessionId == req.body.sessionId) {
          return res.status(400).json({ message: "Already Booked" });
        }
      }

      const result = BookingModel.create(booking);
      console.log(result.insertId);
      res.status(200).json({ message: "Booking Created" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }
}
