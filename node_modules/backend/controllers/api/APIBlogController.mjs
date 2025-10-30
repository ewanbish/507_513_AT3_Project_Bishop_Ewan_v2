import express from "express";
import { BlogModel } from "../../models/BlogModel.mjs";
import { APIAuthenticationController } from "./APIAuthenticationController.mjs";
export class APIBlogController {
  static routes = express.Router();

  static {
    this.routes.post(
      "/",
      APIAuthenticationController.restrict("any"),
      this.createBlog
    );
    this.routes.get("/", this.getBlogPosts);
    this.routes.delete(
      "/:id",
      APIAuthenticationController.restrict("any"),
      this.deleteBlog
    );
  }

  static async createBlog(req, res) {
    try {
      const post = new BlogModel(
        req.body.id,
        //user id,
        req.body.postContent,
        req.body.postTite
      );
      const result = await BlogModel.create(post);
      console.log(result.insertId);
      res.status(200).json({
        message: "Post Created",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Database Error",
      });
    }
  }
  static async getBlogPosts(req, res) {
    try {
      const posts = await BlogModel.getAll();
      res.status(200).json({ posts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }
  static async deleteBlog(req, res) {
    try {
      const result = BlogModel.delete(req.params.id);
      if (result.affectedRows == 1) {
        res.status(200).json({
          message: "Post Deleted",
        });
      } else {
        res.status(404).json({
          message: "Not found - Selected blog post could not be found",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Database Error",
      });
    }
  }
}
