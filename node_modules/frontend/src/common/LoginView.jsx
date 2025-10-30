import { useState } from "react";

function LoginView() {
  const [isRegistering, setIsRegistering] = useState(false);

  const toggleMode = () => setIsRegistering((prev) => !prev);

  return (
    <section>
      <h1>ML Strength</h1>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">
          {isRegistering ? "Register" : "Login"}
        </legend>

        {/* Name field only shows in register mode */}
        {isRegistering && (
          <>
            <label className="label">First Name</label>
            <input type="text" className="input" placeholder="First Name" />
            <label className="label">Last Name</label>
            <input type="text" className="input" placeholder="Last Name" />
          </>
        )}

        <label className="label">Email</label>
        <input type="email" className="input" placeholder="Email" />

        <label className="label">Password</label>
        <input type="password" className="input" placeholder="Password" />
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
        <button className="btn btn-neutral mt-4">
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
    </section>
  );
}

export default LoginView;
