import { useState, useEffect, useCallback } from "react";
import { fetchAPI } from "../api.mjs";
import { MdOutlineCancel } from "react-icons/md";
import ErrorAlert from "../common/ErrorAlert";
import { useAuthenticate } from "../authentication/useAuthenticate";
import SuccessAlert from "../common/SuccessAlert";
function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAuthenticate();
  const [loading, setLoading] = useState(null);
  const [success, setSuccess] = useState(null);
  const authKey = localStorage.getItem("auth-key");
  const getBookings = useCallback(() => {
    setBookings([]);
    setError(null);

    const request = fetchAPI("GET", `/booking/${user?.id}`, null, authKey);

    request
      .then((response) => {
        if (response.status == 200) {
          if (response.body.length > 0) {
            console.log(response);
            setError(null);
            setBookings(response.body);
            console.log(bookings);
          } else {
            setBookings([]);
            setError("No bookings found...");
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
        setError(error);
      });
  }, [user?.id]);

  useEffect(() => {
    getBookings();
  }, [getBookings]);

  const handleDelete = async (bookingId) => {
    setLoading(true);
    setError(null);
    const request = fetchAPI("DELETE", `/booking/${bookingId}`, null, authKey);

    request
      .then((response) => {
        setLoading(false);
        if (response.status == 200) {
          setSuccess("Successfully Deleted");
          setBookings((prev) =>
            prev.filter((booking) => booking.id !== bookingId)
          );
        } else {
          setError(response.body.message);
        }
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  };

  return (
    <section className="flex flex-col items-center">
      {error && <span className="p-4 text-error">{error}</span>}
      {bookings.length == 0 ? (
        !error && (
          <span className="loading loading-spinner loading-xl my-8"></span>
        )
      ) : (
        <ul className="list bg-base-100 rounded-box shadow-md w-full max-w-md mx-auto">
          <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
            Your Bookings
          </li>

          {bookings.map((booking) => (
            <li className="list-row" key={booking.id}>
              <div>
                <div>{booking.session.activity.activity_name}</div>
                <div className="text-xs uppercase font-semibold opacity-60 my-1">
                  {booking.session.date}
                </div>
                <div className="text-xs uppercase font-semibold opacity-60">
                  {booking.session.startTime} - {booking.session.endTime}
                </div>
              </div>
              <div className="ml-1">
                <div className="text-xs opacity-60">
                  Trainer: {booking.session.trainer.firstName}{" "}
                  {booking.session.trainer.lastName}
                </div>
                <div className="text-xs  opacity-60 my-1">
                  Location: {booking.session.location.location_name}
                </div>
              </div>
              <button
                className="btn btn-square btn-primary"
                onClick={() => handleDelete(booking.id)}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <MdOutlineCancel />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      <ErrorAlert error={error} />
      <SuccessAlert success={success} />
    </section>
  );
}

export default BookingsPage;
