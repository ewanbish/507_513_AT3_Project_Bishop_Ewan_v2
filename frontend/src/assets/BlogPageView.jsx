// import { useState } from "react";
import { useState, useEffect, useCallback } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { SlSpeech } from "react-icons/sl";
import { fetchAPI } from "../api.mjs";
function BlogPage() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");

  const getPosts = useCallback(
    (filter = "") => {
      setBlogPosts([]);
      setError(null);

      const request =
        filter.length > 0
          ? fetchAPI("GET", "/blog?filter=" + filter)
          : fetchAPI("GET", "/blog");

      request
        .then((response) => {
          if (response.status == 200) {
            if (response.body.fullPosts.length > 0) {
              setError(null);
              setBlogPosts(response.body.fullPosts);
            } else {
              setBlogPosts([]);
              setError("No blog posts found...");
            }
          } else {
            setError(response.body.message);
          }
        })
        .catch((error) => {
          setError(error);
        });
    },
    [setError, setBlogPosts, setFilter]
  );

  useEffect(() => {
    getPosts(filter);
  }, [getPosts, filter]);
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
        <button
          className="btn join-item btn-primary"
          onClick={() => getPosts(filter)}
        >
          <IoSearchSharp />
        </button>
      </div>
      {/* 
      <div>
        <SlSpeech className="size-10" />
      </div> */}
      {error && <span className="p-4 text-error">{error}</span>}
      {blogPosts.length == 0 ? (
        !error && <span className="loading loading-spinner loading-xl"></span>
      ) : (
        <ul className="list self-stretch">
          {blogPosts &&
            blogPosts.map((post) => (
              <BlogCard
                key={post.postId}
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

function BlogCard({ title, content, userId, subtitle, postId }) {
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/blog/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete post");

      console.log("Post deleted successfully!");
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <li key={postId}>
      <div className="card w-96 bg-base-100 card-md shadow-sm mx-auto mb-[50px]">
        <div className="card-body">
          <h2 className="card-title">{title}</h2>
          <p>
            By: <b>{subtitle}</b>
          </p>
          <p>{content}</p>
          <div className="justify-end card-actions">
            {userId === 5 && (
              <button className="btn btn-primary" onClick={handleDelete}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export default BlogPage;
