import { useState, useEffect, useCallback } from "react";
import { fetchAPI } from "../api.mjs";
import { MdOutlineCancel } from "react-icons/md";
import ErrorAlert from "../common/ErrorAlert";
import { useAuthenticate } from "../authentication/useAuthenticate";
import SuccessAlert from "../common/SuccessAlert";
function TrainerSessionPage() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAuthenticate();
  const [loading, setLoading] = useState(null);
  const [success, setSuccess] = useState(null);
  const authKey = localStorage.getItem("auth-key");
  const getSessions = useCallback(() => {
    setSessions([]);
    setError(null);

    const request = fetchAPI("GET", `/session/${user?.id}`, null, authKey);

    request
      .then((response) => {
        if (response.status == 200) {
          if (response.body.length > 0) {
            console.log(response);
            setError(null);
            setSessions(response.body);
          } else {
            setSessions([]);
            setError("No sessions found...");
          }
        } else {
          if (response.status == 400) {
            setError("Invalid Characters");
          } else {
            setError(response.body.message);
          }
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      getSessions();
    }
  }, [getSessions, user?.id]);

  return (
    <section className="flex flex-col items-center">
      {error && <span className="p-4 text-error">{error}</span>}
      {sessions.length == 0 ? (
        !error && (
          <span className="loading loading-spinner loading-xl my-8"></span>
        )
      ) : (
        <ul className="list bg-base-100 rounded-box shadow-md w-96">
          <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
            Your Sessions
          </li>

          {sessions.map((session) => (
            <li className="list-row" key={session.id}>
              <div>
                <div>{session.activity.activity_name}</div>
                <div className="text-xs uppercase font-semibold opacity-60 my-1">
                  {session.date}
                </div>
                <div className="text-xs uppercase font-semibold opacity-60">
                  {session.startTime} - {session.endTime}
                </div>
              </div>
              <div className="ml-1">
                <div className="text-xs opacity-60">
                  Trainer: {session.trainer.firstName}{" "}
                  {session.trainer.lastName}
                </div>
                <div className="text-xs  opacity-60 my-1">
                  Location: {session.location.location_name}
                </div>
              </div>
              {/* <button
                className="btn btn-square btn-primary"
                // onClick={() => handleDelete(booking.id)}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <MdOutlineCancel />
                )}
              </button> */}
            </li>
          ))}
        </ul>
      )}
      <ErrorAlert error={error} />
      <SuccessAlert success={success} />
    </section>
  );
}

export default TrainerSessionPage;
