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

    fetchAPI("GET", `/authenticate/resume/`, null, key)
      .then((response) => {
        if (response.status === 200) {
          setUser(response.body);
          setStatus("loaded");
        } else {
          localStorage.removeItem("auth-key");
          setStatus("unauthenticated");
        }
      })
      .catch(() => setStatus("unauthenticated"));
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
  return {
    user,
    login,
    logout: () => {},
    refresh: () => {},
    status,
  };
}
