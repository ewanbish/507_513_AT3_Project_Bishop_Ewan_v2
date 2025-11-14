import { DatabaseModel } from "./DatabaseModel.mjs";

/**
 * This class handles all Blog CRUD functions
 */
export class BlogModel extends DatabaseModel {
  constructor(id, userId, postContent, postTitle) {
    super();
    this.id = id;
    this.userId = userId;
    this.postContent = postContent;
    this.postTitle = postTitle;
  }
  /**
   * Converts a database row into a BlogModel instance.
   * @param {Object} row - A row object from the database representing a blog post.
   *  @param {number} row.postId - The ID of the blog post.
   *  @param {number} row.userId - The ID of the user who created the post.
   *  @param {string} row.postContent - The content of the blog post.
   *  @param {string} row.postTitle - The title of the blog post.
   * @returns {BlogModel} An instance of BlogModel representing the blog post.
   */
  static tableToModel(row) {
    return new BlogModel(
      row["postId"],
      row["userId"],
      row["postContent"],
      row["postTitle"]
    );
  }
  /**
   * Retrieves all blog posts from the database table.
   * @returns {Promise<BlogModel[]>} A promise that resolves to an array of BlogModel instances.
   */
  static getAll() {
    return this.query(
      "SELECT * FROM blog_posts WHERE deleted = 0 ORDER BY created_at DESC;"
    )
      .then((results) =>
        results.map((row) => this.tableToModel(row.blog_posts))
      )
      .catch((error) => console.error(error));
  }
  /**
   * Retrieves a specific blog post by its ID.
   * @param {number} id - The ID of the blog post to retrieve.
   * @returns {Promise<BlogModel>} - A promise that resolves to a BlogModel instance if found, or rejects with an error message if not.
   */
  static getById(id) {
    return this.query(
      "SELECT * FROM blog_posts WHERE postId = ? AND deleted = 0 ORDER BY created_at DESC;",
      [id]
    )
      .then((result) =>
        result.length > 0
          ? this.tableToModel(result[0].blog_posts)
          : Promise.reject("Post not found")
      )
      .catch((error) => console.error(error));
  }
  /**
   * Creates a new blog post in the database.
   * @param {Object} post - The blog post object to insert.
   * @param {number|null} post.id - The ID of the post (auto-generated).
   * @param {number} post.userId - The ID of the user creating the post.
   * @param {string} post.postContent - The content of the blog post.
   * @param {string} post.postTitle - The title of the blog post.
   * @returns {Promise} A promise that resolves when the post is successfully created.
   * @throws {Error} If the database query fails.
   */
  static async create(post) {
    return this.query(
      `INSERT INTO blog_posts (postId, userId, postContent, postTitle)
    VALUES (?, ?, ?, ?)`,
      [post.id, post.userId, post.postContent, post.postTitle]
    ).catch((error) => {
      throw error;
    });
  }
  /**
   * Deletes a specific blog post by its ID (soft delete).
   * @param {number} id - The ID of the blog post to delete.
   * @returns {Promise<object>} - A promise that resolves to the database result if successful, or rejects with "Post not found" if no post is found.
   */
  static delete(id) {
    return this.query("UPDATE blog_posts SET deleted = 1 WHERE postId = ?", [
      id,
    ])
      .then((result) =>
        result.affectedRows > 0 ? result : Promise.reject("Post not found")
      )
      .catch((error) => console.error(error));
  }
}
