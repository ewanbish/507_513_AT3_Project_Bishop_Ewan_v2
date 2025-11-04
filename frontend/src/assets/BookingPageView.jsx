import { useState, useEffect, useCallback } from "react";
import { IoSearchSharp } from "react-icons/io5";
function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");

  const getBookings = useCallback(
    (filter = "") => {
      const response =
        filter.length > 0
          ? fetch("http://localhost:8080/api/booking?filter=" + filter)
          : fetch("http://localhost:8080/api/booking");

      response
        .then((response) => response.json())
        .then((body) => {
          console.log(body);
          setBookings(body.allBookings);
          if (bookings.length == 0) setError("No sessions found...");
        })
        .catch((error) => {
          setError(String(error));
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
          placeholder="search posts"
        />
        <button className="btn join-item" onClick={() => getBookings(filter)}>
          <IoSearchSharp />
        </button>
      </div>
      {/* 
        <div>
          <SlSpeech className="size-10" />
        </div> */}
      {error && <span className="p-4 text-error">{error}</span>}
      {bookings.length == 0 ? (
        !error && <span className="loading loading-spinner loading-xl"></span>
      ) : (
        <ul className="list self-stretch">
          {bookings.map((post) => (
            <BlogCard
              postId={post.id}
              userId={post.userId}
              title={post.postTitle}
              subtitle={post.user.firstName + " " + post.user.lastName}
              content={post.postContent}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default BookingsPage;
