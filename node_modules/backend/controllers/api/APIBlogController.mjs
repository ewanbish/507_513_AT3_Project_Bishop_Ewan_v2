import express from "express";
import { BlogModel } from "../../models/BlogModel.mjs";
import { APIAuthenticationController } from "./APIAuthenticationController.mjs";
import { UserModel } from "../../models/UserModel.mjs";
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

  /**
   *
   * @openapi
   * /api/blog:
   *   post:
   *     summary: "Create a new Blog Post"
   *     tags: [Blog]
   *     security:
   *       - ApiKeyAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/Blog"
   *     responses:
   *       200:
   *         $ref: "#/components/responses/Created"
   *       500:
   *         $ref: "#/components/responses/Database_Error"
   *       "401":
   *         $ref: "#/components/responses/Not_Authenticated"
   *       "403":
   *         $ref: "#/components/responses/Forbidden"
   *       default:
   *         $ref: "#/components/responses/Database_Error"
   */
  static async createBlog(req, res) {
    try {
      const post = new BlogModel(
        null,
        req.body.id,
        req.body.postContent,
        req.body.postTitle
      );
      const result = await BlogModel.create(post);
      post.id = result.insertId;
      const user = await UserModel.getById(post.userId);
      post.user = user;
      console.log(post);
      res.status(200).json({
        message: "Post Created",
        newPost: post,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Database Error",
      });
    }
  }

  /**
   *
   * @openapi
   * /api/blog:
   *   get:
   *     summary: "Get all Blog Posts from database"
   *     tags: [Blog]
   *     parameters:
   *       - name: filter
   *         in: query
   *         description: Search filter on Blog titles, content and authors.
   *         required: false
   *         schema:
   *           type: string
   *           example: "Push"
   *     responses:
   *       200:
   *         $ref: "#/components/responses/Retrieved"
   *       500:
   *         $ref: "#/components/responses/Database_Error"
   *       default:
   *         $ref: "#/components/responses/Database_Error"
   */
  static async getBlogPosts(req, res) {
    try {
      const posts = await BlogModel.getAll();
      const fullPosts = await Promise.all(
        posts.map(async (post) => {
          const user = await UserModel.getById(post.userId);
          return {
            ...post,
            user, // attach user object to post
          };
        })
      );
      if (req.query.filter) {
        const query = req.query.filter.toLowerCase();
        const filtered = fullPosts.filter((post) => {
          return (
            post.postContent?.toLowerCase().includes(query) ||
            post.postTitle?.toLowerCase().includes(query) ||
            post.user?.firstName?.toLowerCase().includes(query) ||
            post.user?.lastName?.toLowerCase().includes(query)
          );
        });
        return res.status(200).json({ fullPosts: filtered });
      }
      res.status(200).json({ fullPosts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database Error" });
    }
  }
  /**
   *
   * @openapi
   * /api/blog/{id}:
   *   delete:
   *     summary: "Delete a specific Blog Post from the database"
   *     tags: [Blog]
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
   *         $ref: "#/components/responses/Deleted"
   *       500:
   *         $ref: "#/components/responses/Database_Error"
   *       "401":
   *         $ref: "#/components/responses/Not_Authenticated"
   *       "403":
   *         $ref: "#/components/responses/Forbidden"
   *       "404":
   *         $ref: "#/components/responses/Not_Found"
   *       default:
   *         $ref: "#/components/responses/Database_Error"
   */
  static async deleteBlog(req, res) {
    try {
      const result = await BlogModel.delete(req.params.id);
      console.log(result);
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
