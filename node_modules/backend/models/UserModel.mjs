import { DatabaseModel } from "./DatabaseModel.mjs";
import bcrypt from "bcryptjs";
/**
 * This class handles all User CRUD functions
 */
export class UserModel extends DatabaseModel {
  constructor(id, firstName, lastName, email, password, role, deleted) {
    super();
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.role = role;
    this.deleted = deleted;
  }

  /**
   * Converts a database row into a UserModel instance.
   * @param {Object} row The database row containing user data.
   * @returns {UserModel} A new UserModel instance constructed from the row.
   */
  static tableToModel(row) {
    return new UserModel(
      row["userId"],
      row["firstName"],
      row["lastName"],
      row["email"],
      row["password"],
      row["role"],
      row["deleted"]
    );
  }

  /**
   * Retrieves all active users from the users table.
   * @returns {Promise<UserModel[]>} A promise that resolves to an array of UserModel instances.
   */
  static getAll() {
    return this.query("SELECT * FROM users WHERE deleted = 0")
      .then((results) => results.map((row) => this.tableToModel(row.users)))
      .catch((error) => console.error(error));
  }
  /**
   * Retrieves a single active user from the users table by its ID.
   * @param {number|string} id The unique identifier of the user to fetch.
   * @returns {Promise<UserModel>} A promise that resolves to a UserModel instance if found, or rejects with "user not found" if no matching row exists.
   */
  static getById(id) {
    return this.query("SELECT * FROM users WHERE userId = ? AND deleted = 0", [
      id,
    ])
      .then((result) =>
        result.length > 0
          ? this.tableToModel(result[0].users)
          : Promise.reject("user not found")
      )
      .catch((error) => console.error(error));
  }
  /**
   * Retrieves a single active user from the users table by email.
   * @param {string} email The email of the user to fetch.
   * @returns {Promise<UserModel|null>} A promise that resolves to a UserModel instance if found, or null if no matching user exists.
   */
  static getByUsername(email) {
    return this.query("SELECT * FROM users WHERE email = ? AND deleted = 0", [
      email,
    ])
      .then((result) =>
        result.length > 0 ? this.tableToModel(result[0].users) : null
      )
      .catch((err) => console.error(err));
  }
  /**
   * Updates an existing user in the users table by its ID, hashing the password before saving.
   * @param {{id:number|string,firstName:string,lastName:string,email:string,password:string,role:string}} user The user data containing the ID and updated fields.
   * @returns {Promise<Object>} A promise that resolves with the database update result.
   * @throws {Error} If the database update fails.
   */
  static async update(user) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    return this.query(
      `
      UPDATE users
      SET firstName = ?, lastName = ?, email = ?, password = ?, role = ?
      WHERE userId = ?`,
      [
        user.firstName,
        user.lastName,
        user.email,
        hashedPassword,
        user.role,
        user.id,
      ]
    ).catch((error) => {
      console.error(error);
      throw error;
    });
  }
  /**
   * Inserts a new user record into the users table, hashing the password before saving.
   * @param {{id:number|string,firstName:string,lastName:string,email:string,password:string,role:string}} user The user data to insert.
   * @returns {Promise<Object>} A promise that resolves with the database insert result.
   * @throws {Error} If the database insert fails.
   */
  static async create(user) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    return this.query(
      `INSERT INTO users (userID, firstName, lastName, email, password, role)
    VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.firstName,
        user.lastName,
        user.email,
        hashedPassword,
        user.role,
      ]
    ).catch((error) => {
      console.error(error);
      throw error;
    });
  }
  /**
   * Marks a user as deleted in the users table by its ID.
   * @param {number|string} id The unique identifier of the user to delete.
   * @returns {Promise<Object>} A promise that resolves with the database result if a user was updated, or rejects with "user not found" if no rows were affected.
   */
  static delete(id) {
    return this.query("UPDATE users SET deleted = 1 WHERE userId = ?", [id])
      .then((result) =>
        result.affectedRows > 0 ? result : Promise.reject("user not found")
      )
      .catch((error) => console.error(error));
  }
}

// TESTING AREA

// const user = new UserModel(
//   null,
//   "Super",
//   "Man",
//   "clarkk@gmail.com",
//   "batman_sucks",
//   "member"
// );
// UserModel.create(user).then((result) => {
//   console.log(result);
//   console.log(user);
// });
