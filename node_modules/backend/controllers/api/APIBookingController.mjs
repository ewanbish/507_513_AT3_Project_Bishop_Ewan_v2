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
   *
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
