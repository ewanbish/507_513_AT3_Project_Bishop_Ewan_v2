import { RouterContextProvider } from "react-router";

export const API_BASE_URL = "http://localhost:8080/api";

/**
 * A wrapper around fetch() to make calling the API easier.
 *
 * @param {"GET | POST | PATCH | PUT | DELETE | string"} method - http method
 * @param {string} route - API route starting with /
 * @param {object | null} body - Optional body data
 * @param {string | null} authKey - Optional authentication key header
 * @returns {Promise<Object>} - Result of the API fetch request
 * @throws {string} - API fetch request error
 */
export async function fetchAPI(method, route, body, authKey) {
  const headers = {
    "Content-type": "application/json",
  };
  if (authKey) {
    headers["x-auth-key"] = authKey;
  }
  try {
    const response = await fetch(API_BASE_URL + route, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
    const status = response.status;
    const responseBody = await response.json();

    if (status == 403 && window.location.pathname !== "/status") {
      window.location.href = "/status";
    }
    if (status == 401 && window.location.pathname !== "/status") {
      window.location.href = "/status";
    }
    return {
      status,
      body: responseBody,
    };
  } catch (error) {
    throw String(error);
  }
}
