// import { useState } from "react";
import { useState, useEffect, useCallback } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { SlSpeech } from "react-icons/sl";
import { fetchAPI } from "../api.mjs";
import ErrorAlert from "../common/ErrorAlert";
import { useAuthenticate } from "../authentication/useAuthenticate";
function BlogPage() {
  const { user } = useAuthenticate();
  const [blogPosts, setBlogPosts] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    },
    [setError, setBlogPosts, setFilter]
  );

  const handleDelete = async (postId) => {
    setIsLoading(true);
    setError(null);
    const request = fetchAPI("DELETE", `/blog/${postId}`);

    request
      .then((response) => {
        setIsLoading(false);
        if (response.status == 200) {
          setBlogPosts((prev) => prev.filter((post) => post.id !== postId));
        } else {
          setError(response.body.message);
        }
      })
      .catch((error) => {
        setError(error);
        setIsLoading(false);
      });
  };

  const handleCreate = async () => {
    setIsLoading(true);
    setError(null);
    const request = fetchAPI("POST", `/blog`, {
      postContent,
      postTitle,
      id: user.id,
    });
    request
      .then((response) => {
        setIsLoading(false);
        if (response.status == 200) {
          setPostContent("");
          setPostTitle("");
          const newPost = response.body.newPost;
          const plainPost = {
            ...newPost,
            user: { ...newPost.user },
          };
          setBlogPosts((prev) => [plainPost, ...prev]);
        } else {
          setError(response.body.message);
        }
      })
      .catch((error) => {
        setError(error);
        setIsLoading(false);
      });
  };
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

      <ul className="list self-stretch">
        {user && (
          <li>
            <div className="card w-96 bg-base-100 card-md shadow-sm mx-auto mb-[50px]">
              <div className="card-body">
                <input
                  className="card-title"
                  type="text"
                  placeholder="Title"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                />

                <textarea
                  className="textarea textarea-ghost"
                  placeholder="Content"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                ></textarea>
                <div className="justify-end card-actions">
                  <button className="btn btn-success" onClick={handleCreate}>
                    {isLoading ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      "Create"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </li>
        )}
        {blogPosts.length == 0
          ? !error && (
              <li className="flex justify-center">
                <span className="loading loading-spinner loading-xl"></span>
              </li>
            )
          : blogPosts.map((post) => (
              <BlogCard
                key={post.id}
                postId={post.id}
                userId={post.userId}
                title={post.postTitle}
                subtitle={post.user.firstName + " " + post.user.lastName}
                content={post.postContent}
                onDelete={handleDelete}
                isLoading={isLoading}
                user={user}
              />
            ))}
      </ul>

      <ErrorAlert error={error} />
    </section>
  );
}

function BlogCard({
  title,
  content,
  userId,
  subtitle,
  postId,
  onDelete,
  isLoading,
  user,
}) {
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
            {userId === user?.id && (
              <button
                className="btn btn-primary"
                onClick={() => onDelete(postId)}
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Delete"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export default BlogPage;
