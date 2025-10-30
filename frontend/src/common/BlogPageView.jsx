import { FaRegUser } from "react-icons/fa";
import { SlSpeech } from "react-icons/sl";
import { FaRegCalendarAlt } from "react-icons/fa";
import { AiOutlineBell } from "react-icons/ai";
function BlogPage() {
  return (
    <section>
      <h1> Getting somewhere</h1>
      <BlogCard />
      <Dock />
    </section>
  );
}

function Dock() {
  return (
    <footer>
      <div class="dock dock-sm">
        <button className=" dock-active">
          <SlSpeech class="size-[1.2em]">
            <g
              fill="currentColor"
              stroke-linejoin="miter"
              stroke-linecap="butt"
            >
              <polyline
                points="1 11 12 2 23 11"
                fill="none"
                stroke="currentColor"
                stroke-miterlimit="10"
                stroke-width="2"
              ></polyline>
              <path
                d="m5,13v7c0,1.105.895,2,2,2h10c1.105,0,2-.895,2-2v-7"
                fill="none"
                stroke="currentColor"
                stroke-linecap="square"
                stroke-miterlimit="10"
                stroke-width="2"
              ></path>
              <line
                x1="12"
                y1="22"
                x2="12"
                y2="18"
                fill="none"
                stroke="currentColor"
                stroke-linecap="square"
                stroke-miterlimit="10"
                stroke-width="2"
              ></line>
            </g>
          </SlSpeech>
        </button>

        <SessionsButton />

        <button className="hover:dock-active">
          <AiOutlineBell class="size-[1.2em]">
            <g
              fill="currentColor"
              stroke-linejoin="miter"
              stroke-linecap="butt"
            >
              <circle
                cx="12"
                cy="12"
                r="3"
                fill="none"
                stroke="currentColor"
                stroke-linecap="square"
                stroke-miterlimit="10"
                stroke-width="2"
              ></circle>
              <path
                d="m22,13.25v-2.5l-2.318-.966c-.167-.581-.395-1.135-.682-1.654l.954-2.318-1.768-1.768-2.318.954c-.518-.287-1.073-.515-1.654-.682l-.966-2.318h-2.5l-.966,2.318c-.581.167-1.135.395-1.654.682l-2.318-.954-1.768,1.768.954,2.318c-.287.518-.515,1.073-.682,1.654l-2.318.966v2.5l2.318.966c.167.581.395,1.135.682,1.654l-.954,2.318,1.768,1.768,2.318-.954c.518.287,1.073.515,1.654.682l.966,2.318h2.5l.966-2.318c.581-.167,1.135-.395,1.654-.682l2.318.954,1.768-1.768-.954-2.318c.287-.518.515-1.073.682-1.654l2.318-.966Z"
                fill="none"
                stroke="currentColor"
                stroke-linecap="square"
                stroke-miterlimit="10"
                stroke-width="2"
              ></path>
            </g>
          </AiOutlineBell>
        </button>
        <button className="hover:dock-active">
          <FaRegUser class="size-[1.2em]">
            <g
              fill="currentColor"
              stroke-linejoin="miter"
              stroke-linecap="butt"
            >
              <circle
                cx="12"
                cy="12"
                r="3"
                fill="none"
                stroke="currentColor"
                stroke-linecap="square"
                stroke-miterlimit="10"
                stroke-width="2"
              ></circle>
              <path
                d="m22,13.25v-2.5l-2.318-.966c-.167-.581-.395-1.135-.682-1.654l.954-2.318-1.768-1.768-2.318.954c-.518-.287-1.073-.515-1.654-.682l-.966-2.318h-2.5l-.966,2.318c-.581.167-1.135.395-1.654.682l-2.318-.954-1.768,1.768.954,2.318c-.287.518-.515,1.073-.682,1.654l-2.318.966v2.5l2.318.966c.167.581.395,1.135.682,1.654l-.954,2.318,1.768,1.768,2.318-.954c.518.287,1.073.515,1.654.682l.966,2.318h2.5l.966-2.318c.581-.167,1.135-.395,1.654-.682l2.318.954,1.768-1.768-.954-2.318c.287-.518.515-1.073.682-1.654l2.318-.966Z"
                fill="none"
                stroke="currentColor"
                stroke-linecap="square"
                stroke-miterlimit="10"
                stroke-width="2"
              ></path>
            </g>
          </FaRegUser>
        </button>
      </div>
    </footer>
  );
}

function SessionsButton() {
  const handleFetch = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/blog");
      if (!response.ok) throw new Error(response.json);

      const result = await response.json();
      console.log("Fetched successfully:", result); // optional, just for dev
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  return (
    <button className="hover:dock-active" onClick={handleFetch}>
      <FaRegCalendarAlt class="size-[1.2em]">
        <g fill="currentColor" stroke-linejoin="miter" stroke-linecap="butt">
          <polyline
            points="1 11 12 2 23 11"
            fill="none"
            stroke="currentColor"
            stroke-miterlimit="10"
            stroke-width="2"
          ></polyline>
          <path
            d="m5,13v7c0,1.105.895,2,2,2h10c1.105,0,2-.895,2-2v-7"
            fill="none"
            stroke="currentColor"
            stroke-linecap="square"
            stroke-miterlimit="10"
            stroke-width="2"
          ></path>
          <line
            x1="12"
            y1="22"
            x2="12"
            y2="18"
            fill="none"
            stroke="currentColor"
            stroke-linecap="square"
            stroke-miterlimit="10"
            stroke-width="2"
          ></line>
        </g>
      </FaRegCalendarAlt>
    </button>
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
