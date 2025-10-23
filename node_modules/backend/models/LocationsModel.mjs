import { DatabaseModel } from "./DatabaseModel.mjs";
/**
 * This class handles all locations CRUD functions
 */
export class LocationModel extends DatabaseModel {
  constructor(id, location_name) {
    super();
    this.id = id;
    this.location_name = location_name;
  }
  /**
   * Converts a database row into a LocationModel instance.
   * @param {Object} row The database row containing location data.
   * @returns {LocationModel} A new LocationModel instance constructed from the row.
   */
  static tableToModel(row) {
    return new LocationModel(row["location_id"], row["location_name"]);
  }

  /**
   * Retrieves all active locations from the locations table.
   * @returns {Promise<LocationModel[]>} A promise that resolves to an array of LocationModel instances.
   */
  static getAll() {
    return this.query("SELECT * FROM locations WHERE deleted = 0")
      .then((results) => results.map((row) => this.tableToModel(row.locations)))
      .catch((error) => console.error(error));
  }
  /**
   * Retrieves a single active location from the locations table by its ID.
   * @param {number|string} id The unique identifier of the location to fetch.
   * @returns {Promise<LocationModel>} A promise that resolves to a LocationModel instance if found, or rejects with "location not found" if no matching row exists.
   */
  static getById(id) {
    return this.query(
      "SELECT * FROM locations WHERE location_id = ? AND deleted = 0",
      [id]
    )
      .then((result) =>
        result.length > 0
          ? this.tableToModel(result[0].locations)
          : Promise.reject("location not found")
      )
      .catch((error) => console.error(error));
  }
  /**
   * Inserts a new location record into the locations table.
   * @param {{id:number|string,location_name:string}} location The location data to insert.
   * @returns {Promise<Object>} A promise that resolves with the database insert result.
   * @throws {Error} If the database insert fails.
   */
  static create(location) {
    return this.query(
      `INSERT INTO locations (location_id, location_name)
    VALUES (?, ?)`,
      [location.id, location.location_name]
    ).catch((error) => {
      console.error(error);
      throw error;
    });
  }
  /**
   * Marks a location as deleted in the locations table by its ID.
   * @param {number|string} id The unique identifier of the location to delete.
   * @returns {Promise<Object>} A promise that resolves with the database result if a location was updated, or rejects with "location not found" if no rows were affected.
   */
  static delete(id) {
    return this.query(
      "UPDATE locations SET deleted = 1 WHERE location_id = ?",
      [id]
    )
      .then((result) =>
        result.affectedRows > 0 ? result : Promise.reject("location not found")
      )
      .catch((error) => console.error(error));
  }
  /**
   * Updates the name of a location in the locations table by its ID.
   * @param {{id:number|string,name:string}} location The location data containing the ID and new name.
   * @returns {Promise<Object>} A promise that resolves with the database update result.
   * @throws {Error} If the database update fails.
   */
  static update(location) {
    return this.query(
      `
      UPDATE locations
      SET location_name = ?
      WHERE location_id = ?`,
      [location.name, location.id]
    ).catch((error) => {
      console.error(error);
      throw error;
    });
  }
}
