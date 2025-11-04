import { FaRegUser } from "react-icons/fa";
import { SlSpeech } from "react-icons/sl";
import { FaRegCalendarAlt } from "react-icons/fa";
import { AiOutlineBell } from "react-icons/ai";
import { useNavigate, Outlet, useLocation } from "react-router";
function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <main className="max-w-[430px] min-h-screen mx-auto shadow">
      <Outlet />
      <nav className="dock max-w-[430px] mx-auto">
        <button
          onClick={() => navigate("/blog")}
          className={location.pathname == "/blog" ? "dock-active" : ""}
        >
          <span className="dock-label">
            <SlSpeech className="text-2xl" />
          </span>
        </button>
        <button
          onClick={() => navigate("/session")}
          className={location.pathname == "/session" ? "dock-active" : ""}
        >
          <span className="dock-label">
            <FaRegCalendarAlt className="text-2xl" />
          </span>
        </button>
        <button
          onClick={() => navigate("/booking")}
          className={location.pathname == "/booking" ? "dock-active" : ""}
        >
          <span className="dock-label">
            <AiOutlineBell className="text-2xl" />
          </span>
        </button>
        <button
          onClick={() => navigate("/user")}
          className={location.pathname == "/user" ? "dock-active" : ""}
        >
          <span className="dock-label">
            <FaRegUser className="text-2xl" />
          </span>
        </button>
      </nav>
    </main>
  );
}
export default Layout;
