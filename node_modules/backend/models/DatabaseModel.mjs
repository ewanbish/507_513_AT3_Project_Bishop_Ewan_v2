import mysql from "mysql2/promise";

/**
 * This class configures the database connection
 */
export class DatabaseModel {
  static connection;

  static {
    this.connection = mysql.createPool({
      host: "localhost",
      user: "high_street_gym",
      password: "Gym4Life",
      database: "507_513_at2_bishop_ewan_database",
      nestTables: true,
    });
  }
  /**
   * Executes a SQL query on the database and returns the result.
   * @param {string} sql The SQL query string to execute.
   * @param {any[]} values An array of values to safely substitute into the SQL query.
   * @returns {Promise<Object>} A promise that resolves with the database query result.
   */
  static query(sql, values) {
    return this.connection
      .query(sql, values)
      .then(([result]) => result)
      .catch((error) => console.error(error));
  }
  /**
   * Formats a JavaScript Date object into MySQL's YYYY-MM-DD date format.
   * @param {Date} date The date to format.
   * @returns {string} The formatted date string in YYYY-MM-DD format.
   */
  static toMySqlDate(date) {
    const year = date.toLocaleString("default", { year: "numeric" });
    const month = date.toLocaleString("default", { month: "2-digit" });
    const day = date.toLocaleString("default", { day: "2-digit" });

    return [year, month, day].join("-");
  }
}
