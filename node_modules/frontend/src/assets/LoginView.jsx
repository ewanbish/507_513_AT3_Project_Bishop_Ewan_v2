import { useState } from "react";

function LoginView() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const toggleMode = () => setIsRegistering((prev) => !prev);

  const authenticate = async () => {
    console.log(isRegistering);
    try {
      if (isRegistering === true) {
        console.log("here");
        const response = await fetch(
          `http://localhost:8080/api/authenticate/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: null,
              email: email,
              password: password,
              firstName: firstName,
              lastName: lastName,
              role: "member",
            }),
          }
        );
        if (!response.ok) throw new Error("Failed to register user");
        const data = await response.json();
        console.log("Register successful:", data);
      } else if (isRegistering === false) {
        const response = await fetch(`http://localhost:8080/api/authenticate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        });
        if (!response.ok) throw new Error("Failed to authenticate user");
        const data = await response.json();
        console.log("Login successful:", data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <section>
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
        <button className="btn btn-neutral mt-4" onClick={authenticate}>
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
