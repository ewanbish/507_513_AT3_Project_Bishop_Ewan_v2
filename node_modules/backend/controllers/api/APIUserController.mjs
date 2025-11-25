import express from "express";
import { UserModel } from "../../models/UserModel.mjs";
import { APIAuthenticationController } from "./APIAuthenticationController.mjs";
import { ValidationController } from "../ValidationController.mjs";
export class APIUserController {
  static routes = express.Router();

  static {
    this.routes.get(
      "/:id",
      APIAuthenticationController.restrict("any"),
      this.getUserById
    );
    this.routes.put(
      "/:id",
      APIAuthenticationController.restrict("any"),
      this.updateUser
    );
    this.routes.patch(
      "/:id",
      APIAuthenticationController.restrict("any"),
      this.patchUser
    );
  }

  /**
   *
   * @openapi
   * /api/user/{id}:
   *   get:
   *     summary: "Get a User by id"
   *     tags: [Users]
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
   *         $ref: "#/components/responses/Retrieved"
   *       "500":
   *         $ref: "#/components/responses/Database_Error"
   *       "401":
   *         $ref: "#/components/responses/Not_Authenticated"
   *       "403":
   *         $ref: "#/components/responses/Forbidden"
   *       default:
   *         $ref: "#/components/responses/Generic_Error"
   *
   */
  static async getUserById(req, res) {
    try {
      const user = await UserModel.getById(req.params.id);
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }

  /**
   *
   * @openapi
   * /api/user/{id}:
   *   put:
   *     summary: "Update an existing user"
   *     tags: [Users]
   *     security:
   *       - ApiKeyAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/User"
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/Updated"
   *       "404":
   *         $ref: "#/components/responses/Not_Found"
   *       "500":
   *         $ref: "#/components/responses/Database_Error"
   *       "401":
   *         $ref: "#/components/responses/Not_Authenticated"
   *       "403":
   *         $ref: "#/components/responses/Forbidden"
   *       400:
   *         $ref: "#/components/responses/Invalid_Credentials"
   *       default:
   *         $ref: "#/components/responses/Generic_Error"
   */
  static async updateUser(req, res) {
    try {
      const user = new UserModel(
        req.params.id,
        ValidationController.validateName(req.body.firstName),
        ValidationController.validateName(req.body.lastName),
        ValidationController.validateEmail(req.body.email),
        req.body.password,
        req.body.role,
        req.body.deleted,
        req.body.authenticationKey
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

      if (error.message) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Database Error" });
      }
    }
  }

  /**
   *
   * @openapi
   * /api/user/{id}:
   *   patch:
   *     summary: "Partially update an existing user"
   *     tags: [Users]
   *     security:
   *       - ApiKeyAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               newPassword:
   *                 type: string
   *                 example: "Password1*"
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/Updated"
   *       "404":
   *         $ref: "#/components/responses/Not_Found"
   *       "500":
   *         $ref: "#/components/responses/Database_Error"
   *       "401":
   *         $ref: "#/components/responses/Not_Authenticated"
   *       "403":
   *         $ref: "#/components/responses/Forbidden"
   *       400:
   *         $ref: "#/components/responses/Invalid_Credentials"
   *       default:
   *         $ref: "#/components/responses/Generic_Error"
   */
  static async patchUser(req, res) {
    try {
      console.log("Endpoint reached");
      console.log(req.body.newPassword);
      const currentUser = await UserModel.getById(req.params.id);
      const newUser = new UserModel(
        currentUser.id,
        currentUser.firstName,
        currentUser.lastName,
        currentUser.email,
        ValidationController.validatePassword(req.body.newPassword),
        currentUser.role,
        currentUser.deleted,
        currentUser.authenticationKey
      );
      const result = await UserModel.update(newUser);
      console.log(result);
      if (result.affectedRows == 1) {
        console.log("Successfully updated");
        res.status(200).json({
          message: "User Updated",
        });
      } else {
        console.log("Unsucessful update");
        res.status(404).json({
          message: "Couldn't find user",
        });
      }
    } catch (error) {
      console.error(error);

      if (error.message) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Database Error" });
      }
    }
  }
}
