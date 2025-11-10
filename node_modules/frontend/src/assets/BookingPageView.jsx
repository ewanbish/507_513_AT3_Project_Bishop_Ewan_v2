import { useState, useEffect, useCallback } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { fetchAPI } from "../api.mjs";
import { MdOutlineCancel } from "react-icons/md";
function BookingsPage() {
  const [bookings, setBookings] = useState([
    {
      bookingId: 1,
      userId: 1,
      sessionId: 1,
      session: {
        activity: "Pilates",
        date: "wedenesday",
        time: "2:00 - 4:00",
        location: "Chermside",
      },
      user: {
        firstName: "Caiden",
      },
    },
  ]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");

  const getBookings = useCallback(
    (filter = "") => {
      setBookings([]);
      setError(null);

      const request =
        filter.length > 0
          ? fetchAPI("GET", "/booking?filter=" + filter)
          : fetchAPI("GET", "/booking");

      request
        .then((response) => {
          if (response.status == 200) {
            if (response.body.length > 0) {
              setError(null);
              setBookings(response.body);
            } else {
              setBookings([]);
              setError("No bookings found...");
            }
          } else {
            setError(response.body.message);
          }
        })
        .catch((error) => {
          setError(error);
        });
    },
    [setError, setBookings]
  );

  useEffect(() => {
    getBookings();
  }, [getBookings]);
  return (
    <section className="flex flex-col items-center">
      <div className="join p-4 self-stretch">
        <input
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
          type="text"
          className="input join-item grow"
          placeholder="search bookings"
        />
        <button
          className="btn join-item btn-primary"
          onClick={() => getBookings(filter)}
        >
          <IoSearchSharp />
        </button>
      </div>
      {error && <span className="p-4 text-error">{error}</span>}
      {bookings.length == 0 ? (
        !error && <span className="loading loading-spinner loading-xl"></span>
      ) : (
        <ul className="list bg-base-100 rounded-box shadow-md w-96">
          <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
            Your Bookings
          </li>

          {bookings.map((booking) => (
            <li className="list-row" key={booking.bookingId}>
              <div>
                <div>{booking.session.activity.activity_name}</div>
                <div className="text-xs uppercase font-semibold opacity-60">
                  {booking.session.startTime} - {booking.session.endTime}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold opacity-60">
                  {booking.session.location.location_name}
                </div>
              </div>
              <button className="btn btn-square btn-primary">
                <MdOutlineCancel />
              </button>
            </li>
          ))}
        </ul>
        // <ul className="list self-stretch">

        // </ul>
      )}
    </section>
  );
}

export default BookingsPage;
