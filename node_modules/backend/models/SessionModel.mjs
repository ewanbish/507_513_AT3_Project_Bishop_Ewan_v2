import { DatabaseModel } from "./DatabaseModel.mjs";
/**
 * This class handles all session CRUD functions
 */
export class SessionModel extends DatabaseModel {
  constructor(id, activity, trainer, location, date, startTime, endTime) {
    super();
    this.id = id;
    this.activity = activity;
    this.trainer = trainer;
    this.location = location;
    this.date = date;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  /**
   * Converts a database row into a SessionModel instance.
   * @param {Object} row The database row containing session data.
   * @returns {SessionModel} A new SessionModel instance constructed from the row.
   */
  static tableToModel(row) {
    return new SessionModel(
      row["sessionId"],
      row["activity_id"],
      row["trainer_id"],
      row["location_id"],
      row["date"],
      row["start_time"],
      row["end_time"]
    );
  }

  /**
   * Retrieves all active sessions from the sessions table, ordered by date proximity.
   * @returns {Promise<SessionModel[]>} A promise that resolves to an array of SessionModel instances.
   */
  static getAll() {
    return this.query(
      `SELECT sessionId, activity_id, trainer_id, location_id, DATE_FORMAT(date, '%Y-%m-%d') AS date, DATE_FORMAT(start_time, '%h:%i %p') AS start_time,
      DATE_FORMAT(end_time, '%h:%i %p') AS end_time FROM sessions WHERE deleted = 0 ORDER BY ABS(DATEDIFF(date, CURDATE())) ASC`
    )
      .then((results) => {
        return results.map((row) => {
          const sessionData = { ...row.sessions, ...row[""] };
          return this.tableToModel(sessionData);
        });
      })
      .catch((error) => console.error(error));
  }
  /**
   * Retrieves a single active session from the sessions table by its ID.
   * @param {number|string} id The unique identifier of the session to fetch.
   * @returns {Promise<SessionModel>} A promise that resolves to a SessionModel instance if found, or rejects with "session not found" if no matching row exists.
   */
  static getById(id) {
    return this.query(
      `SELECT sessionId, activity_id, trainer_id, location_id, DATE_FORMAT(date, '%Y-%m-%d') AS date, DATE_FORMAT(start_time, '%h:%i %p') AS start_time,
      DATE_FORMAT(end_time, '%h:%i %p') AS end_time FROM sessions WHERE sessionId = ? AND deleted = 0 ORDER BY ABS(DATEDIFF(date, CURDATE())) ASC`,
      [id]
    )
      .then((result) => {
        const row = result[0];

        if (result.length > 0) {
          const sessionData = { ...row.sessions, ...row[""] };
          return this.tableToModel(sessionData);
        } else {
          Promise.reject("session not found");
        }
      })
      .catch((error) => {
        console.error(error);
        throw new error();
      });
  }
  /**
   * Retrieves all active sessions from the sessions table that occur on a specific date.
   * @param {string|Date} date The date to filter sessions by.
   * @returns {Promise<SessionModel[]>} A promise that resolves to an array of SessionModel instances.
   */
  static getByDate(date) {
    return this.query(
      "SELECT sessionId, activity_id, trainer_id, location_id, DATE_FORMAT(date, '%Y-%m-%d') AS date, start_time, end_time FROM sessions WHERE date = ? AND deleted = 0",
      [date]
    )
      .then((results) => {
        console.log("results: ");
        console.log(results);
        return results.map((row) => this.tableToModel(row.sessions));
      })
      .catch((error) => console.error(error));
  }
  /**
   * Retrieves all active sessions from the sessions table for a specific trainer.
   * @param {number|string} id The unique identifier of the trainer.
   * @returns {Promise<SessionModel[]>} A promise that resolves to an array of SessionModel instances.
   */
  // static getByUserId(id) {
  //   return this.query(
  //     "SELECT sessionId, activity_id, trainer_id, location_id, DATE_FORMAT(date, '%Y-%m-%d') AS date, start_time, end_time FROM sessions WHERE trainer_id = ? AND deleted = 0",
  //     [id]
  //   )
  //     .then((results) => {
  //       console.log("results: ");
  //       console.log(results);
  //       if (results.length < 1) throw new Error("No sessions found");
  //       console.log("here");
  //       return results.map((row) => {
  //         console.log("now im here");
  //         // Flatten the weird structure
  //         const flatRow = { ...row.sessions, ...row[""] };
  //         return this.tableToModel(flatRow);
  //       });
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //       throw error;
  //     });
  // }
  static getByUserId(id) {
    return this.query(
      "SELECT sessionId, activity_id, trainer_id, location_id, DATE_FORMAT(date, '%Y-%m-%d') AS date, start_time, end_time FROM sessions WHERE trainer_id = ? AND deleted = 0",
      [id]
    )
      .then((results) => {
        console.log("results: ");
        console.log(results);
        if (results.length < 1) throw new Error("No sessions found");
        console.log("here");
        return results.map((row) => {
          console.log("now im here");
          // Flatten the nested structure
          const flatRow = { ...row.sessions, ...row[""] };
          console.log("flatRow:", flatRow);
          return this.tableToModel(flatRow);
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }
  /**
   * Updates an existing session in the sessions table by its ID.
   * @param {{id:number|string,activity:number|string,trainer:number|string,location:number|string,date:string,startTime:string,endTime:string}} session The session data containing the ID and updated fields.
   * @returns {Promise<Object>} A promise that resolves with the database update result.
   * @throws {Error} If the database update fails.
   */
  static update(session) {
    return this.query(
      `
      UPDATE sessions
      SET activity_id = ?, trainer_id = ?, location_id = ?, date = ?, start_time = ?, end_time = ?
      WHERE sessionId = ?`,
      [
        session.activity,
        session.trainer,
        session.location,
        session.date,
        session.startTime,
        session.endTime,
        session.id,
      ]
    ).catch((error) => {
      console.error(error);
      throw error;
    });
  }
  /**
   * Inserts a new session record into the sessions table.
   * @param {{id:number|string,activity:number|string,trainer:number|string,location:number|string,date:string,startTime:string,endTime:string}} session The session data to insert.
   * @returns {Promise<Object>} A promise that resolves with the database insert result.
   * @throws {Error} If the database insert fails.
   */
  static create(session) {
    return this.query(
      `INSERT INTO sessions (sessionId, activity_id, trainer_id, location_id, date, start_time, end_time)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        session.id,
        session.activity,
        session.trainer,
        session.location,
        session.date,
        session.startTime,
        session.endTime,
      ]
    ).catch((error) => {
      console.error(error);
      throw error;
    });
  }
  /**
   * Marks a session as deleted in the sessions table by its ID.
   * @param {number|string} id The unique identifier of the session to delete.
   * @returns {Promise<Object>} A promise that resolves with the database result if a session was updated, or rejects with "session not found" if no rows were affected.
   */
  static delete(id) {
    return this.query("UPDATE sessions SET deleted = 1 WHERE sessionId = ?", [
      id,
    ])
      .then((result) =>
        result.affectedRows > 0 ? result : Promise.reject("session not found")
      )
      .catch((error) => console.error(error));
  }

  /**
   * Marks all sessions with a past date as deleted in the sessions table.
   * @returns {Promise<string>} A promise that resolves to a message indicating how many sessions were marked deleted or that no expired sessions were found, or rejects with an error message if the update fails.
   */
  static markExpiredSessionsDeleted() {
    return this.query(
      `UPDATE sessions 
     SET deleted = 1 
     WHERE date < CURDATE() 
       AND deleted = 0`
    )
      .then((result) => {
        if (result.affectedRows > 0) {
          return `${result.affectedRows} session(s) marked as deleted`;
        } else {
          return "No expired sessions found";
        }
      })
      .catch((error) => {
        console.error(error);
        return Promise.reject("Error updating expired sessions");
      });
  }
  /**
   *
   * @param {Date} start
   * @param {Date} end
   * @returns {Promise<Array<SaleProductModel>>}
   */
  static getByStartAndEndDate(start, end) {
    return this.query(
      `
        SELECT sessionId, activity_id, trainer_id, location_id, DATE_FORMAT(date, '%Y-%m-%d') AS date, start_time, end_time FROM sessions  
        WHERE sessions.date BETWEEN ? AND ? 
        AND deleted = 0
        `,
      [this.toMySqlDate(start), this.toMySqlDate(end)]
    ).then((results) => {
      return results.map((row) => {
        console.log("now im here");
        // Flatten the nested structure
        const flatRow = { ...row.sessions, ...row[""] };
        console.log("flatRow:", flatRow);
        return this.tableToModel(flatRow);
      });
    });
  }
}
