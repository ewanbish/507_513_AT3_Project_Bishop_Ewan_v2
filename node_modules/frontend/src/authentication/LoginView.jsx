import { useCallback, useEffect, useState } from "react";
import { fetchAPI } from "../api.mjs";
import { useNavigate } from "react-router";
import ErrorAlert from "../common/ErrorAlert";
import { useAuthenticate } from "../authentication/useAuthenticate";

function LoginView() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState(null);
  const { login, authenticate, status, user } = useAuthenticate();
  const navigate = useNavigate();
  const toggleMode = () => setIsRegistering((prev) => !prev);

  useEffect(() => {
    if (status === "loaded") {
      navigate("/blog");
    } else if (status === "Invalid credentials") {
      setError(status);
    }
  }, [status, navigate]);

  return (
    <section className="flex justify-center">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">
          {isRegistering ? "Register" : "Login"}
        </legend>

        {/* Name field only shows in register mode */}
        {isRegistering && (
          <>
            <label className="label">First Name</label>
            <input
              type="text"
              className="input"
              placeholder="First Name"
              onChange={(e) => setFirstName(e.target.value)}
            />
            <label className="label">Last Name</label>
            <input
              type="text"
              className="input"
              placeholder="Last Name"
              onChange={(e) => setLastName(e.target.value)}
            />
          </>
        )}

        <label className="label">Email</label>
        <input
          type="email"
          className="input"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="label">Password</label>
        <input
          type="password"
          className="input"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="btn btn-primary mt-4"
          onClick={() => {
            if (isRegistering) {
              authenticate(email, password, firstName, lastName);
            } else {
              login(email, password);
            }
          }}
        >
          {status == "authenticating" || waiting ? (
            <span className="loading loading-spinner"></span>
          ) : isRegistering ? (
            "Register"
          ) : (
            "Login"
          )}
        </button>

        {/* Toggle button */}
        <button
          className="label m-auto mt-1"
          type="button"
          onClick={toggleMode}
        >
          {isRegistering ? "Login" : "Register"}
        </button>
      </fieldset>
      <ErrorAlert error={error} onClear={() => setError(null)} />
    </section>
  );
}

export default LoginView;
