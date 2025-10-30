import { FaRegUser } from "react-icons/fa";
import { SlSpeech } from "react-icons/sl";
import { FaRegCalendarAlt } from "react-icons/fa";
import { AiOutlineBell } from "react-icons/ai";

export function Dock({ children }) {
  return (
    <footer>
      <div class="dock dock-sm">{children}</div>
    </footer>
  );
}

export function BlogButton({ className = "" }) {
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
    <button className={`${className}`} onClick={handleFetch}>
      <SlSpeech class="size-[1.2em]">
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
      </SlSpeech>
    </button>
  );
}

export function BookingsButton({ className = "" }) {
  const handleFetch = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/booking");
      if (!response.ok) throw new Error(response.json);

      const result = await response.json();
      console.log("Fetched successfully:", result); // optional, just for dev
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  return (
    <button className={`${className}`} onClick={handleFetch}>
      <AiOutlineBell class="size-[1.2em]">
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
      </AiOutlineBell>
    </button>
  );
}
export function TimetableButton({ className = "" }) {
  const handleFetch = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/session");
      if (!response.ok) throw new Error(response.json);

      const result = await response.json();
      console.log("Fetched successfully:", result); // optional, just for dev
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };
  return (
    <button className={`${className}`} onClick={handleFetch}>
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
export function UserButton({ className = "" }) {
  const handleFetch = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/user");
      if (!response.ok) throw new Error(response.json);

      const result = await response.json();
      console.log("Fetched successfully:", result); // optional, just for dev
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };
  return (
    <button className={`${className}`} onClick={handleFetch}>
      <FaRegUser class="size-[1.2em]">
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
      </FaRegUser>
    </button>
  );
}
