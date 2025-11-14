import { DatabaseModel } from "./DatabaseModel.mjs";

/**
 * This class handles all booking CRUD functions
 */
export class BookingModel extends DatabaseModel {
  constructor(id, sessionId, userId) {
    super();
    this.id = id;
    this.sessionId = sessionId;
    this.userId = userId;
  }

  /**
   * Converts a database row into a BookingModel instance.
   * @param {object} row - A single row from the bookings table.
   * @returns {BookingModel} A BookingModel instance representing the row.
   */
  static tableToModel(row) {
    return new BookingModel(row["bookingId"], row["sessionId"], row["userId"]);
  }

  /**
   * Retrieves all bookings from the bookings table.
   * @returns {Promise<BookingModel[]>} A promise that resolves to an array of BookingModel instances.
   */
  static getAll() {
    return this.query("SELECT * FROM bookings WHERE deleted = 0")
      .then((results) => results.map((row) => this.tableToModel(row.bookings)))
      .catch((error) => console.error(error));
  }
  /**
   * Retrieves a specific booking by its ID.
   * @param {number|string} id - The ID of the booking to retrieve.
   * @returns {Promise<BookingModel>} A promise that resolves to a BookingModel instance if found, or rejects if not.
   */
  static getById(id) {
    return this.query(
      "SELECT * FROM bookings WHERE bookingId = ? AND deleted = 0",
      [id]
    )
      .then((result) =>
        result.length > 0
          ? this.tableToModel(result[0].bookings)
          : Promise.reject("booking not found")
      )
      .catch((error) => console.error(error));
  }
  /**
   * This function will return all bookings that match a certain session Id
   * @param {number|string} sessionId - The session ID of bookings to retrieve
   * @returns {Promise<BookingModel>} A promise that resolves to a BookingModel instance if found, or rejects if not.
   */
  static getAllOfSessionId(sessionId) {
    return this.query(
      "SELECT * FROM bookings WHERE sessionId = ? AND deleted = 0",
      [sessionId]
    )
      .then((results) => {
        console.log("results: ");
        console.log(results);
        return results.map((row) => this.tableToModel(row.bookings));
      })
      .catch((error) => console.error(error));
  }

  /**
   * Retrieves all active bookings associated with a specific user ID.
   * @param {number|string} UserId The unique identifier of the user whose bookings should be fetched.
   * @returns {Promise<Object[]>} A promise that resolves to an array of booking objects formatted through `tableToModel()`.
   */
  static getAllOfUserId(UserId) {
    return this.query(
      "SELECT * FROM bookings WHERE UserId = ? AND deleted = 0",
      [UserId]
    )
      .then((results) => {
        console.log("results: ");
        console.log(results);
        return results.map((row) => this.tableToModel(row.bookings));
      })
      .catch((error) => console.error(error));
  }

  /**
   * Inserts a new booking record into the bookings table.
   * @param {{id:number|string,sessionId:number|string,userId:number|string}} booking The booking data to insert.
   * @returns {Promise<Object>} A promise that resolves with the database query result of the insert operation.
   * @throws {Error} If the database insert fails.
   */
  static create(booking) {
    return this.query(
      `INSERT INTO bookings (bookingId, sessionId, userId)
    VALUES (?, ?, ?)`,
      [booking.id, booking.sessionId, booking.userId]
    ).catch((error) => {
      console.error(error);
      throw error;
    });
  }
  /**
   * Marks a booking as deleted in the bookings table by its ID.
   * @param {number|string} id The unique identifier of the booking to delete.
   * @returns {Promise<Object>} A promise that resolves with the database result if a booking was updated, or rejects with "booking not found" if no rows were affected.
   */
  static delete(id) {
    return this.query("UPDATE bookings set deleted = 1 WHERE bookingId = ?", [
      id,
    ]).then((result) => {
      console.log(result);
      if (result.affectedRows > 0) {
        return result;
      } else {
        throw new Error("booking not found");
      }
    });
  }

  /**
   * Updates the sessionId of a booking in the bookings table by its bookingId.
   * @param {number|string} sessionId The new session ID to assign to the booking.
   * @param {number|string} bookingId The unique identifier of the booking to update.
   * @returns {Promise<Object>} A promise that resolves with the database update result.
   * @throws {Error} If the database update fails.
   */
  static update(sessionId, bookingId) {
    return this.query(
      `
      UPDATE bookings
      SET sessionId = ?
      WHERE bookingId = ?`,
      [sessionId, bookingId]
    ).catch((error) => {
      console.error(error);
      throw error;
    });
  }
}
