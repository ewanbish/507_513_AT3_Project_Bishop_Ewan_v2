import express from "express";
import { BlogModel } from "../models/BlogModel.mjs";
import { UserModel } from "../models/UserModel.mjs";
import { AuthenticationController } from "./Authentication.mjs";
import { ValidationController } from "./ValidationController.mjs";
/**
 * This controller handles all Blog CRUD
 */
export class BlogController {
  static routes = express.Router();

  static {
    this.routes.get(
      "/",
      AuthenticationController.restrict([
        "trainer",
        "admin",
        "member",
        "guest",
      ]),
      this.viewBlogPage
    );
    this.routes.get(
      "/create",
      AuthenticationController.restrict(["member", "trainer", "admin"]),
      this.viewCreatePage
    );
    this.routes.post(
      "/post",
      AuthenticationController.restrict(["trainer", "admin", "member"]),
      this.createPost
    );
    this.routes.get(
      "/delete/:id",
      AuthenticationController.restrict(["trainer", "admin", "member"]),
      this.deletePost
    );
  }

  /**
   * Renders the blog page with all user posts and their author information.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} req.session.loginId - ID of the logged-in user
   *   @param {string} req.session.role - Role of the logged-in user
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a rendered blog view or error page; does not return a value
   */
  static viewBlogPage(req, res) {
    const loginId = req.session.loginId;
    BlogModel.getAll()
      .then((posts) => {
        const fetchingUser = posts.map((post) => {
          return UserModel.getById(post.userId)
            .then((user) => {
              return {
                ...post,
                firstName: user.firstName,
                lastName: user.lastName,
                loginId,
              };
            })
            .catch((error) => {
              return res.status(500).render("status.ejs", {
                message: error,
                role: req.session.role,
              });
            });
        });

        return Promise.all(fetchingUser);
      })
      .then((postData) => {
        res.render("blog_page.ejs", {
          postData,
          loginId: req.session.loginId,
          role: req.session.role,
          page: "blog",
        });
      })
      .catch((error) => {
        return res
          .status(500)
          .render("status.ejs", { message: error, role: req.session.role });
      });
  }

  /**
   * Renders the page for creating a new blog post.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} req.session.role - Role of the current user
   *   @param {string} req.session.loginId - ID of the logged-in user
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a rendered create post view; does not return a value
   */
  static viewCreatePage(req, res) {
    res.render("blog_create_page.ejs", {
      role: req.session.role,
      loginId: req.session.loginId,
    });
  }

  /**
   * Creates a new blog post using input from the request body and inserts it into the database.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} req.body.title - Title of the post
   *   @param {string} req.body.content - Content of the post
   *   @param {string} req.session.loginId - ID of the logged-in user creating the post
   *   @param {string} req.session.role - Role of the logged-in user
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a redirect or renders an error page; does not return a value
   */
  static createPost(req, res) {
    try {
      const title = ValidationController.validateText(req.body.title);
      const content = ValidationController.validateText(req.body.content);

      const post = new BlogModel(null, req.session.loginId, content, title);
      BlogModel.create(post)
        .then((result) => {
          res.redirect("/blog");
        })
        .catch((error) => {
          return res
            .status(500)
            .render("status.ejs", { message: error, role: req.session.role });
        });
    } catch (error) {
      return res
        .status(400)
        .render("status.ejs", { message: error, role: req.session.role });
    }
  }
  /**
   * Deletes a blog post from the database by its ID and redirects to the blog page.
   *
   * @param {import("express").Request} req - Express request object, with:
   *   @param {string} req.params.id - ID of the post to delete
   *   @param {string} req.session.role - Role of the logged-in user
   * @param {import("express").Response} res - Express response object
   * @returns {void} Sends a redirect or renders an error page; does not return a value
   */
  static deletePost(req, res) {
    const postId = req.params.id;
    BlogModel.delete(postId)
      .then((result) => res.redirect("/blog"))
      .catch((error) => {
        return res
          .status(500)
          .render("status.ejs", { message: error, role: req.session.role });
      });
  }
}
