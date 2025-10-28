import express from "express";
import { UserModel } from "../../models/UserModel.mjs";

export class APIUserController {
  static routes = express.Router();

  static {
    this.routes.post("/", this.createUser);
    this.routes.get("/:id", this.getUserById);
    this.routes.put("/:id", this.updateUser);
    this.routes.patch("/:id", this.patchUser);
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
      const result = await UserModel.create(user);
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
  static async updateUser(req, res) {
    try {
      const user = new UserModel(
        req.body.id,
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        req.body.password,
        req.body.role
      );
      const result = await UserModel.update(user);
      console.log(result);
      if (result.affectedRows == 1) {
        res.status(200).json({
          message: "User Updated",
        });
      } else {
        res.status(404).json({
          message: "Couldn't find user",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }
  static async patchUser(req, res) {
    try {
      const currentUser = await UserModel.getById(req.params.id);
      const newUser = new UserModel(
        currentUser.id,
        currentUser.firstName,
        currentUser.lastName,
        currentUser.email,
        req.body.password,
        currentUser.role
      );
      const result = await UserModel.update(newUser);
      console.log(result);
      if (result.affectedRows == 1) {
        res.status(200).json({
          message: "User Updated",
        });
      } else {
        res.status(404).json({
          message: "Couldn't find user",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }
}
