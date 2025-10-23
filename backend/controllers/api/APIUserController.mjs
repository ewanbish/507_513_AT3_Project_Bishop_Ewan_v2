import express from "express";
import { UserModel } from "../../models/UserModel.mjs";

export class APIUserController {
  static routes = express.Router();

  static {
    this.routes.post("/", this.createUser);
    this.routes.get("/:id", this.getUserById);
  }

  static async createUser(req, res) {
    try {
      const user = new UserModel(
        req.body.id,
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        req.body.password,
        req.body.role
      );
      const result = UserModel.create(user);
      console.log(result.insertId);
      res.status(200).json({
        message: "User Created",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }
  static async getUserById(req, res) {
    try {
      const user = await UserModel.getById(req.params.id);
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }
}
