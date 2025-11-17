import { useCallback, useEffect, useState } from "react";
import { fetchAPI } from "../api.mjs";
import ErrorAlert from "../common/ErrorAlert";
import { useAuthenticate } from "../authentication/useAuthenticate";
function UserPage() {
  // User details:
  const { user } = useAuthenticate();
  const [selectedUser, setSelectedUser] = useState({});
  const [newUser, setNewUser] = useState({});
  const [newPassword, setNewPassword] = useState();
  const [matchPassword, setMatchPassword] = useState();

  // Errors
  const [error, setError] = useState();
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(null);
  const authKey = localStorage.getItem("auth-key");
  const getUser = useCallback(() => {
    console.log(user);
    setSelectedUser(null);
    setLoading(true);
    fetchAPI("GET", `/user/${user.id}`, null, authKey)
      .then((response) => {
        if (response.status == 200) {
          setSelectedUser(response.body);
          setNewUser(response.body);
          setError(null);
          setLoading(false);
        } else {
          setError("An error has occured");
          setLoading(false);
        }
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [setSelectedUser]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    console.log(newUser);
    try {
      fetchAPI("PUT", `/user/${user.id}`, newUser).then((response) => {
        if (response.status == 200) {
          getUser();
          setLoading(false);
        } else {
          setError("An error has occured");
          setLoading(false);
        }
      });
    } catch (error) {
      setError(error);
    }
  };

  const handlePatch = async () => {
    setError(null);
    setLoading(true);
    if (newPassword !== matchPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      fetchAPI("PATCH", `/user/${user.id}`, { newPassword }).then(
        (response) => {
          if (response.status == 200) {
            getUser();
            setLoading(false);
          } else {
            setError("An error has occured");
            setLoading(false);
          }
        }
      );
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };
  if (!user) {
    return (
      <section className="flex flex-col items-center justify-center">
        <span className="loading loading-spinner my-8"></span>
      </section>
    );
  }
  return (
    <section className="flex flex-col items-center justify-center">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">User Details: </legend>

        <label className="label">Email: </label>
        <input
          type="email"
          className="input input-primary"
          placeholder={user.email}
          onChange={(e) => setNewUser({ ...user, email: e.target.value })}
        />
        {validationErrors["email"] && (
          <label className="label text-red-500 justify-self-end">
            Validation errors
          </label>
        )}
        <label className="label">Name: </label>
        <input
          type="text"
          className="input input-primary"
          placeholder={user.firstName}
          onChange={(e) => setNewUser({ ...user, firstName: e.target.value })}
        />
        {validationErrors["firstName"] && (
          <label className="label text-red-500 justify-self-end">
            Validation errors
          </label>
        )}
        <input
          type="text"
          className="input input-primary"
          placeholder={user.lastName}
          onChange={(e) => setNewUser({ ...user, lastName: e.target.value })}
        />
        {validationErrors["lastName"] && (
          <label className="label text-red-500 justify-self-end">
            Validation errors
          </label>
        )}
        <button className="btn btn-neutral mt-4" onClick={handleSave}>
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Save Changes"
          )}
        </button>
      </fieldset>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 mt-8">
        <legend className="fieldset-legend">Change Password: </legend>
        <input
          type="password"
          className="input input-primary"
          placeholder="Password"
          onChange={(e) => setNewPassword(e.target.value)}
        />
        {validationErrors["password"] && (
          <label className="label text-red-500 justify-self-end">
            Validation errors
          </label>
        )}
        <input
          type="password"
          className="input input-primary"
          placeholder="Confirm Password"
          onChange={(e) => setMatchPassword(e.target.value)}
        />
        {validationErrors["matchPassword"] && (
          <label className="label text-red-500 justify-self-end">
            Validation errors
          </label>
        )}
        <button className="btn btn-neutral mt-4" onClick={handlePatch}>
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Update Password"
          )}
        </button>
      </fieldset>
      <ErrorAlert error={error} onClear={() => setError(null)} />
    </section>
  );
}

export default UserPage;
