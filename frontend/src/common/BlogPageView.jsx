import {
  Dock,
  BlogButton,
  TimetableButton,
  BookingsButton,
  UserButton,
} from "./NavView";
import { useState } from "react";
function BlogPage() {
  const [blogPosts, setBlogPosts] = useState([]);
  return (
    <section>
      {blogPosts &&
        blogPosts.map((post) => (
          <BlogCard
            postId={post.id}
            userId={post.userId}
            title={post.postTitle}
            subtitle={post.user.firstName + " " + post.user.lastName}
            content={post.postContent}
          />
        ))}

      <Dock>
        <BlogButton className="dock-active" setBlogPosts={setBlogPosts} />
        <TimetableButton className="hover:dock-active" />
        <BookingsButton className="hover:dock-active" />
        <UserButton className="hover:dock-active" />
      </Dock>
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
    <section className="card w-96 bg-base-100 card-md shadow-sm">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>By: {subtitle}</p>
        <p>{content}</p>
        <div className="justify-end card-actions">
          {userId === 5 && (
            <button className="btn btn-error" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default BlogPage;
