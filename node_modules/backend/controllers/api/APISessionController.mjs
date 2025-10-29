import express from "express";
import { SessionModel } from "../../models/SessionModel.mjs";
import { APIAuthenticationController } from "./APIAuthenticationController.mjs";
export class APISessionController {
  static routes = express.Router();

  static {
    this.routes.get("/", this.getSessions);
    this.routes.get("/:id", this.getSessionById);
    this.routes.delete(
      "/:id",
      APIAuthenticationController.restrict("trainer"),
      this.deleteSession
    );
  }

  static async getSessions(req, res) {
    try {
      const allSessions = await SessionModel.getAll();
      res.status(200).json(allSessions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }
  static async getSessionById(req, res) {
    try {
      const session = await SessionModel.getById(req.params.id);
      res.status(200).json(session);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }
  static async deleteSession(req, res) {
    try {
      const result = await SessionModel.delete(req.params.id);
      if (result.affectedRows == 1) {
        res.status(200).json({
          message: "Session Deleted",
        });
      } else {
        res.status(404).json({
          message: "Not Found - The selected session could not be found",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }
}
