import { DatabaseModel } from "./DatabaseModel.mjs";
/**
 * This class handles all avitvities CRUD opertaions
 */
export class ActivitiesModel extends DatabaseModel {
  constructor(id, activity_name) {
    super();
    this.id = id;
    this.activity_name = activity_name;
  }

  /**
   * This function converts a database row into an ActivitiesModel instance.
   *
   * @param {Object} row - A database row object containing activity data.
   *   @param {number|string} row.activity_id - The ID of the activity from the database.
   *   @param {string} row.activity_name - The name of the activity from the database.
   * @returns {ActivitiesModel} - Returns a new ActivitiesModel instance populated with the database row data.
   */
  static tableToModel(row) {
    return new ActivitiesModel(row["activity_id"], row["activity_name"]);
  }
  /**
   * This function retrieves all activities from the database that are not marked as deleted.
   *
   * @returns {Promise<ActivitiesModel[]>} - A promise that resolves to an array of ActivitiesModel instances.
   * @throws {Error} - Throws an error if the database query fails.
   */
  static getAll() {
    return this.query("SELECT * FROM activities WHERE deleted = 0")
      .then((results) =>
        results.map((row) => this.tableToModel(row.activities))
      )
      .catch((error) => console.error(error));
  }
  /**
   * This function retrieves a specific activity from the database by its ID.
   *
   * @param {string|number} id - The ID of the activity to retrieve.
   * @returns {Promise<ActivitiesModel>} - A promise that resolves to an ActivitiesModel instance.
   * @throws {Error} - Throws an error if the activity is not found or the database query fails.
   */
  static getById(id) {
    return this.query(
      "SELECT * FROM activities WHERE activity_id = ? AND deleted = 0",
      [id]
    )
      .then((result) =>
        result.length > 0
          ? this.tableToModel(result[0].activities)
          : Promise.reject("Activity not found")
      )
      .catch((error) => console.error(error));
  }
  /**
   * This function will create a new activity in the database.
   *
   * @param {ActivitiesModel} activity - The activity object containing `id` and `activity_name`.
   * @returns {Promise<void>} - A promise that resolves when the activity is successfully inserted.
   * @throws {Error} - Throws an error if the database query fails.
   */
  static create(activity) {
    return this.query(
      `INSERT INTO activities (activity_id, activity_name)
    VALUES (?, ?)`,
      [activity.id, activity.activity_name]
    ).catch((error) => {
      console.error(error);
      throw error;
    });
  }
  /**
   * This function will mark a certain activity as deleted in the database by its ID.
   *
   * @param {number|string} id - The ID of the activity to delete.
   * @returns {Promise<object>} - A promise that resolves with the result of the query if successful.
   * @throws {Error} - Throws an error if the activity is not found or the database query fails.
   */
  static delete(id) {
    return this.query(
      "UPDATE activities SET deleted = 1 WHERE activity_id = ?",
      [id]
    )
      .then((result) =>
        result.affectedRows > 0 ? result : Promise.reject("activity  not found")
      )
      .catch((error) => console.error(error));
  }
  /**
   * This function will update a certain activity in the database by its ID.
   *
   * @param {ActivitiesModel} activity - The activity object containing updated data.
   *  @param {string|number} activity.id - The ID of the activity to update.
   *  @param {string} activity.activity_name - The new name of the activity.
   * @returns {Promise<object>} - A promise that resolves with the result of the update query.
   * @throws {Error} - Throws an error if the database query fails.
   */
  static update(activity) {
    return this.query(
      `
      UPDATE activities
      SET activity_name = ?
      WHERE activity_id = ?`,
      [activity.name, activity.id]
    ).catch((error) => {
      console.error(error);
      throw error;
    });
  }
}
