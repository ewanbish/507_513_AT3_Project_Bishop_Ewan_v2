import express from "express";
import { LocationModel } from "../models/LocationsModel.mjs";
import { ActivitiesModel } from "../models/ActivitiesModel.mjs";
import { ValidationController } from "./ValidationController.mjs";
import { AuthenticationController } from "./Authentication.mjs";

/**
 * This class is used to handle the Activities / Locations CRUD
 */
export class ItemsController {
  static routes = express.Router();

  static {
    this.routes.post(
      "/update/:item",
      AuthenticationController.restrict(["admin"]),
      this.handleUpdateItem
    );
    this.routes.post(
      "/create/:item",
      AuthenticationController.restrict(["admin"]),
      this.handleCreateItem
    );
    this.routes.get(
      "/delete/:item/:id",
      AuthenticationController.restrict(["admin"]),
      this.handleDeleteItem
    );
    this.routes.get(
      "/:item",
      AuthenticationController.restrict(["trainer", "admin"]),
      this.viewItemManage
    );
    this.routes.get(
      "/:item/:id",
      AuthenticationController.restrict(["trainer", "admin"]),
      this.viewItemManage
    );
  }
  /**
   * Renders the Activities or Locations management view based on request parameters.
   *
   * Retrieves all items and optionally a selected item by ID or query.
   * Supports optional search filtering and handles errors by rendering a 500 status page.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} req.params.item - The type of item to manage ("locations" or "activities")
   *   @param {string} [req.params.id] - Optional item ID to select
   *   @param {string} [req.query.itemId] - Optional item ID from query
   *   @param {string} [req.query.search] - Optional search string to filter items
   *   @param {string} req.session.role - Role of the current user
   *   @param {string} req.session.loginId - ID of the current logged-in user
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a rendered view or error page; does not return a value
   */

  static viewItemManage(req, res) {
    console.log("you have reached this route");
    const role = req.session.role;
    const loginId = req.session.loginId;
    const item = req.params.item;
    console.log(item);
    let itemId;
    if (req.params.id) {
      itemId = req.params.id;
    } else {
      itemId = req.query.itemId ?? null;
    }
    const search = req.query.search ?? null;
    let selectedItem = [];
    if (item === "locations") {
      selectedItem = new LocationModel(null, null);
      LocationModel.getAll()
        .then((items) => {
          let allItems = items.map((i) => ({
            id: i.id,
            name: i.location_name,
          }));
          if (search) {
            allItems = allItems.filter(
              (item) =>
                item.name &&
                item.name.toLowerCase().includes(search.toLowerCase())
            );
          }
          if (itemId) {
            LocationModel.getById(itemId)
              .then((result) => {
                selectedItem = { id: result.id, name: result.location_name };
                res.render("manage_items.ejs", {
                  item,
                  selectedItem,
                  allItems,
                  role,
                  loginId,
                  page: "location",
                });
              })
              .catch((error) => {
                return res.status(500).render("status.ejs", {
                  message: error,
                  role: req.session.role,
                });
              });
          } else {
            res.render("manage_items.ejs", {
              item,
              selectedItem,
              allItems,
              role,
              loginId,
              page: "location",
            });
          }
        })
        .catch((error) => {
          return res
            .status(500)
            .render("status.ejs", { message: error, role: req.session.role });
        });
    } else {
      selectedItem = new ActivitiesModel(null, null);
      ActivitiesModel.getAll()
        .then((items) => {
          let allItems = items.map((i) => ({
            id: i.id,
            name: i.activity_name,
          }));
          if (search) {
            allItems = allItems.filter(
              (item) =>
                item.name &&
                item.name.toLowerCase().includes(search.toLowerCase())
            );
          }
          if (itemId) {
            ActivitiesModel.getById(itemId)
              .then((result) => {
                selectedItem = { id: result.id, name: result.activity_name };
                res.render("manage_items.ejs", {
                  item,
                  selectedItem,
                  allItems,
                  role,
                  loginId,
                  page: "activity",
                });
              })
              .catch((error) => {
                return res.status(500).render("status.ejs", {
                  message: error,
                  role: req.session.role,
                });
              });
          } else {
            res.render("manage_items.ejs", {
              item,
              selectedItem,
              allItems,
              role,
              loginId,
              page: "activity",
            });
          }
        })
        .catch((error) => {
          return res
            .status(500)
            .render("status.ejs", { message: error, role: req.session.role });
        });
    }
  }

  /**
   * Creates a new Activity or Location based on request parameters.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} req.params.item - The type of item to create ("locations" or "activities")
   *   @param {string} req.body.name - Name for the new item (validated)
   *   @param {string} req.body.action - Action to perform ("Delete" triggers error)
   *   @param {string} req.session.role - Role of the current user
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a redirect or renders a response; does not return a value
   */
  static handleCreateItem(req, res) {
    const item = req.params.item;
    let itemName = null;
    if (item === "locations") {
      itemName = "Location";
    } else {
      itemName = "Activity";
    }
    const id = req.params.id;
    if (req.body.action === "Delete") {
      return res.status(400).render("status.ejs", {
        role: req.session.role,
        message: "Cannot delete a new " + itemName,
      });
    }
    try {
      let newItem = [];
      if (item === "locations") {
        newItem = new LocationModel(
          null,
          ValidationController.validateName(req.body.name)
        );
        LocationModel.create(newItem)
          .then((result) => {
            return res.redirect("/sessionItems/locations");
          })
          .catch((error) => {
            return res
              .status(500)
              .render("status.ejs", { message: error, role: req.session.role });
          });
      } else {
        newItem = new ActivitiesModel(
          null,
          ValidationController.validateName(req.body.name)
        );
        ActivitiesModel.create(newItem)
          .then((result) => {
            return res.redirect("/sessionItems/activities");
          })
          .catch((error) => {
            return res
              .status(500)
              .render("status.ejs", { message: error, role: req.session.role });
          });
      }
    } catch (error) {
      return res
        .status(400)
        .render("status.ejs", { message: error, role: req.session.role });
    }
  }

  /**
   * Updates an Activity or Location based on request parameters, or redirects to deletion if requested.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} req.params.item - The type of item to update ("locations" or "activities")
   *   @param {string} req.body.id - ID of the item to update
   *   @param {string} req.body.name - New name for the item (validated)
   *   @param {string} req.body.action - Action to perform ("Delete" triggers redirect)
   *   @param {string} req.session.role - Role of the current user
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a redirect or renders a response; does not return a value
   */
  static handleUpdateItem(req, res) {
    const item = req.params.item;
    const id = Number(req.body.id);
    console.log("YUURRR " + id);
    if (req.body.action === "Delete") {
      return res.redirect("/sessionItems/delete/" + item + "/" + id);
    }
    try {
      let newItem = {
        id: Number(req.body.id),
        name: ValidationController.validateName(req.body.name),
      };
      if (item === "locations") {
        LocationModel.update(newItem)
          .then((result) => {
            return res.redirect("/sessionItems/locations");
          })
          .catch((error) => {
            return res
              .status(500)
              .render("status.ejs", { message: error, role: req.session.role });
          });
      } else {
        ActivitiesModel.update(newItem)
          .then((result) => {
            return res.redirect("/sessionItems/activities");
          })
          .catch((error) => {
            return res
              .status(500)
              .render("status.ejs", { message: error, role: req.session.role });
          });
      }
    } catch (error) {
      return res
        .status(400)
        .render("status.ejs", { message: error, role: req.session.role });
    }
  }
  /**
   * Deletes an Activity or Location based on request parameters and redirects accordingly.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} req.params.item - The type of item to delete ("locations" or "activities")
   *   @param {string} req.params.id - The ID of the item to delete
   *   @param {string} req.session.role - Role of the current user
   * @param {import("express").Response} res - Express response object used to send redirect or render views
   * @returns {void} This function does not return a value; it sends a redirect or renders a response.
   */
  static handleDeleteItem(req, res) {
    const item = req.params.item;
    const id = req.params.id;
    console.log("yooo" + id);
    if (id) {
      if (item === "locations") {
        LocationModel.delete(id)
          .then((result) => {
            return res.redirect("/sessionItems/locations");
          })
          .catch((error) => {
            return res
              .status(500)
              .render("status.ejs", { message: error, role: req.session.role });
          });
      } else {
        ActivitiesModel.delete(id)
          .then((result) => {
            return res.redirect("/sessionItems/activities");
          })
          .catch((error) => {
            return res
              .status(500)
              .render("status.ejs", { message: error, role: req.session.role });
          });
      }
    } else {
      res.status(400).render("status.ejs", {
        message: "No Item Selected",
        role: req.session.role,
      });
    }
  }
}
