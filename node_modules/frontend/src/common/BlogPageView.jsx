import {
  Dock,
  BlogButton,
  TimetableButton,
  BookingsButton,
  UserButton,
} from "./NavView";
function BlogPage() {
  return (
    <section>
      <h1> Getting somewhere</h1>
      <BlogCard />
      <Dock>
        <BlogButton className="dock-active" />
        <TimetableButton className="hover:dock-active" />
        <BookingsButton className="hover:dock-active" />
        <UserButton className="hover:dock-active" />
      </Dock>
    </section>
  );
}

function BlogCard() {
  return (
    <section className="card w-96 bg-base-100 card-md shadow-sm">
      <div class="card-body">
        <h2 class="card-title">Blog Title</h2>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusantium
          omnis ad consequuntur qui, inventore quos dolore rem labore possimus
          sint, iure voluptatem iste beatae illo eius provident libero
          molestiae. Rem.
        </p>
        <div class="justify-end card-actions">
          <button class="btn btn-error">Delete</button>
        </div>
      </div>
    </section>
  );
}

export default BlogPage;
