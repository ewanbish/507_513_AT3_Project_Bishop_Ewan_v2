import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchAPI } from "../api.mjs";

export const AuthenticationContext = createContext(null);

export function AuthenticationProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("resuming");

  useEffect(() => {
    console.log("here");
    const key = localStorage.getItem("auth-key");
    if (!key) {
      setStatus("unauthenticated");
      return;
    }

    fetchAPI("GET", `/authenticate/resume`, null, key)
      .then((response) => {
        if (response.status === 200) {
          setUser(response.body);
          setStatus("loaded");
        } else {
          // Don't log out — just mark as restricted
          setStatus("forbidden");
        }
      })
      .catch(() => setStatus("resume_failed"));
  }, []);

  return (
    <AuthenticationContext.Provider value={[user, setUser, status, setStatus]}>
      {children}
    </AuthenticationContext.Provider>
  );
}

export function useAuthenticate(restrictToRoles = null) {
  const [user, setUser, status, setStatus] = useContext(AuthenticationContext);

  const login = useCallback(
    (email, password) => {
      console.log("this is happening");
      const body = {
        email,
        password,
      };

      setStatus("authenticating");
      fetchAPI("POST", "/authenticate", body)
        .then((response) => {
          if (response.status == 200) {
            localStorage.setItem("auth-key", response.body.key);
            setUser(response.body.user);
            console.log(response);
            console.log(response.body.message);
            setStatus("loaded");
          } else {
            setStatus(response.body.message);
          }
        })
        .catch((error) => {
          setStatus(error);
        });
    },
    [setStatus, setUser]
  );

  const authenticate = useCallback(
    (email, password, firstName, lastName) => {
      try {
        if (!password || !email || !firstName || !lastName) {
          setError("Please fill in all fields");
          return;
        }

        const body = {
          id: null,
          email: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
          role: "member",
        };
        const request = fetchAPI("POST", `/authenticate/register/`, body);

        request.then((response) => {
          if (response.status == 200) {
            localStorage.setItem("auth-key", response.body.key);
            setUser(response.body.user);
            console.log(response);
            console.log(response.body.message);
            setStatus("loaded");
          } else {
            setError(response.body.message);
          }
        });
      } catch (error) {
        setStatus(error);
      }
    },
    [setStatus, setUser]
  );

  const logout = useCallback(() => {
    fetchAPI("DELETE", "/authenticate", null, user.authenticationKey).then(
      (response) => {
        setUser(null);
        localStorage.removeItem("auth-key");
        setStatus("removed");
      }
    );
  }, [setUser, user]);
  return {
    user,
    login,
    authenticate,
    logout,
    status,
  };
}
