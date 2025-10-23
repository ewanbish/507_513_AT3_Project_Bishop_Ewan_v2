import express from "express";
import validator from "validator";

/**
 * This class handles input validation and sanitation for all kinda of input
 */
export class ValidationController {
  /**
   * Validates an email input and throws an error if invalid.
   * @param {string} input - The email input to validate
   * @throws {Error} If the input is empty or not a valid email
   * @returns {string} Returns the trimmed and validated email
   */
  static validateEmail(input) {
    if (!input) {
      throw new Error("Email is required");
    }
    const cleanEmail = validator.trim(input);
    const isEmail = validator.isEmail(cleanEmail);
    if (!isEmail) {
      throw new Error("Please enter a valid email");
    }
    return cleanEmail;
  }
  /**
   * Validates a password input for strength and required criteria.
   * @param {string} input - The password input to validate
   * @throws {Error} If the input is empty or does not meet strength requirements
   * @returns {string} Returns the trimmed and validated password
   */
  static validatePassword(input) {
    if (!input) {
      throw new Error("Password is required");
    }
    const cleanPas = validator.trim(input);
    const isStrong = validator.isStrongPassword(cleanPas, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });
    if (!isStrong) {
      throw new Error(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol"
      );
    }
    return cleanPas;
  }
  /**
   * Validates a generic text input, removing invalid characters.
   * @param {string} input - The text input to validate
   * @throws {Error} If the input is empty or contains only invalid characters
   * @returns {string} Returns the cleaned and validated text
   */
  static validateText(input) {
    if (!input) throw new Error("Text field cannot be empty");
    let cleanText = validator.trim(input);
    cleanText = validator.whitelist(cleanText, "a-zA-Z0-9 .,!?()'-");
    if (!cleanText) throw new Error("Text field cannot be empty or invalid");
    return cleanText;
  }
  /**
   * Validates a name input, allowing letters, whitespace, hyphen, or apostrophe.
   * @param {string} input - The name input to validate
   * @throws {Error} If the name is less than 2 characters or contains invalid characters
   * @returns {string} Returns the cleaned and validated name
   */
  static validateName(input) {
    const cleanName = this.validateText(input);
    if (!validator.matches(cleanName, /^[A-Za-z' -]{2,}$/)) {
      throw new Error(
        "Name must be at least 2 characters and can only include letters, whitepace, hyphen, or apostrophe"
      );
    }
    return cleanName;
  }
  /**
   * Validates a date input ensuring it is a valid date and not in the past.
   * @param {string} input - The date input to validate
   * @throws {Error} If the input is missing, invalid, or a past date
   * @returns {string} Returns the cleaned and validated date string
   */
  static validateDate(input) {
    if (!input) {
      throw new Error("Date is required");
    }
    const cleanDate = validator.trim(input);
    if (!validator.isDate(cleanDate)) {
      throw new Error("Invalid date");
    }

    const inputDate = new Date(cleanDate);
    const today = new Date();

    // normalize both dates to midnight so only calendar days are compared
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      throw new Error("Date cannot be in the past");
    }
    return cleanDate;
  }
  /**
   * Validates a time input in 12-hour format (e.g., '9:20am' or '09:20 pm')
   * and converts it to a MySQL-compatible TIME string (HH:MM:SS).
   * @param {string} input - The time input to validate
   * @throws {Error} If the input is missing or does not match the expected time format
   * @returns {string} Returns the validated time string in 'HH:MM:SS' format
   */
  static validateTime(input) {
    console.log(input);
    const cleanTime = validator.trim(input).toLowerCase();
    console.log(cleanTime);
    const match = cleanTime.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
    if (!match) {
      throw new Error(
        "Invalid time format. Expected format like '9:20am' or '09:20 pm'"
      );
    }

    let hours = parseInt(match[1], 10);
    let minutes = parseInt(match[2], 10);
    const modifier = match[3];

    // Adjust hours for AM/PM
    if (modifier === "pm" && hours !== 12) {
      hours += 12;
    }
    if (modifier === "am" && hours === 12) {
      hours = 0;
    }

    // Return MySQL-compatible TIME (HH:MM:SS)
    console.log(" no errors here");
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:00`;
  }
}
