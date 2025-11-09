import { useState, useEffect } from "react";
import { fetchAPI } from "../api.mjs";
import { MdErrorOutline } from "react-icons/md";
import { useNavigate } from "react-router";

function LoginView() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const toggleMode = () => setIsRegistering((prev) => !prev);
  const [error, setError] = useState(null);
  const [visibleError, setVisibleError] = useState(null);
  const [doAlertAnimate, setDoAlertAnimate] = useState(false);
  const navigate = useNavigate();
  const authenticate = async () => {
    console.log(isRegistering);
    try {
      //TODO: Add more validation
      setError(null);
      if (!password) {
        setError("Password is empty");
        return;
      }
      if (!email) {
        setError("Email is empty");
        return;
      }
      if (isRegistering === true) {
        const body = JSON.stringify({
          id: null,
          email: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
          role: "member",
        });
        const request = fetchAPI("POST", `authenticate/register`, body);

        request.then((response) => {
          if (response.status == 200) {
            console.log(response);
            console.log("Success");
            navigate("/blog");
          } else {
            setError(response.body.message);
          }
        });
      } else if (isRegistering === false) {
        const body = { email: email, password: password };
        const request = fetchAPI("POST", `/authenticate`, body);

        request.then((response) => {
          if (response.status == 200) {
            navigate("/blog");
          } else {
            setError(response.body.message);
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (error) {
      setVisibleError(error); // show the alert
      setTimeout(() => setDoAlertAnimate(true), 1);

      const timer = setTimeout(() => {
        setDoAlertAnimate(false);
        const hideTimer = setTimeout(() => setVisibleError(null), 300); // match transition duration
        setError(null);
        return () => clearTimeout(hideTimer);
      }, 2000);

      return () => clearTimeout(timer); // cleanup if error changes
    }
  }, [error]);

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
        {isRegistering && (
          <>
            <label className="label">Confirm Password</label>
            <input
              type="password"
              className="input"
              placeholder="Confirm Password"
            />
          </>
        )}
        <button className="btn btn-primary mt-4" onClick={authenticate}>
          {isRegistering ? "Register" : "Login"}
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
      {visibleError && (
        <div
          role="alert"
          className={`
  alert alert-error fixed bottom-4 left-1/2 w-auto max-w-sm z-50 flex items-center gap-2
  transform transition-all duration-300
  ${
    doAlertAnimate
      ? "translate-x-[-50%] translate-y-0"
      : "translate-x-[-50%] translate-y-32"
  }
`}
        >
          <MdErrorOutline className="text-lg" />
          <span>{visibleError}</span>
        </div>
      )}
    </section>
  );
}

export default LoginView;
