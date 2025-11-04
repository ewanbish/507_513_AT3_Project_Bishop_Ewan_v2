import { useState, useEffect, useCallback } from "react";
import { IoSearchSharp } from "react-icons/io5";
function SessionPage() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");

  const getSessions = useCallback(
    (filter = "") => {
      const response =
        filter.length > 0
          ? fetch("http://localhost:8080/api/session?filter=" + filter)
          : fetch("http://localhost:8080/api/session");

      response
        .then((response) => response.json())
        .then((body) => {
          console.log(body);
          setSessions(body.allSessions);
          if (sessions.length == 0) setError("No sessions found...");
        })
        .catch((error) => {
          setError(String(error));
        });
    },
    [setError, setSessions]
  );

  useEffect(() => {
    getSessions();
  }, [getSessions]);
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
        <button className="btn join-item" onClick={() => getSessions(filter)}>
          <IoSearchSharp />
        </button>
      </div>
      {/* 
        <div>
          <SlSpeech className="size-10" />
        </div> */}
      {error && <span className="p-4 text-error">{error}</span>}
      {sessions.length == 0 ? (
        !error && <span className="loading loading-spinner loading-xl"></span>
      ) : (
        <ul className="list self-stretch">
          {sessions.map((post) => (
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

export default SessionPage;
