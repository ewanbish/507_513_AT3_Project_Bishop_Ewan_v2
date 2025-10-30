import express from "express";
import { BookingModel } from "../../models/BookingModel.mjs";
import { APIAuthenticationController } from "./APIAuthenticationController.mjs";
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
      "/:id",
      APIAuthenticationController.restrict("member"),
      this.getBookingById
    );
    this.routes.delete(
      "/:id",
      APIAuthenticationController.restrict("member"),
      this.deleteBooking
    );
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
      res.status(200).json({ allBookings });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }
  static async getBookingById(req, res) {
    try {
      const booking = await BookingModel.getById(req.params.id);
      res.status(200).json(booking);
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
        req.body.id,
        req.body.sessionId
        //user id
      );
      const result = BookingModel.create(booking);
      console.log(result.insertId);
      res.status(200).json({ message: "Booking Created" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }
}
