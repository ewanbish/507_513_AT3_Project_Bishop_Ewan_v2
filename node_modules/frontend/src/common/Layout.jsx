import { FaRegUser } from "react-icons/fa";
import { SlSpeech } from "react-icons/sl";
import { FaRegCalendarAlt } from "react-icons/fa";
import { AiOutlineBell } from "react-icons/ai";
import { useNavigate, Outlet, useLocation } from "react-router";
import { useAuthenticate } from "../authentication/useAuthenticate";
import { CiExport } from "react-icons/ci";
import { useEffect } from "react";
import { fetchAPI } from "../api.mjs";
import { API_BASE_URL } from "../api.mjs";
function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthenticate();
  const { status } = useAuthenticate();
  const authKey = localStorage.getItem("auth-key");
  const page =
    location.pathname == "/blog"
      ? "Blog"
      : location.pathname == "/"
      ? "ML Strength"
      : location.pathname == "/session"
      ? "Sessions"
      : location.pathname == "/booking"
      ? "Bookings"
      : location.pathname == "/trainer"
      ? "Schedule"
      : location.pathname == "/status"
      ? "Status"
      : "Manage User";

  useEffect(() => {
    if (status == "forbidden") {
      navigate("/status");
    }
  }, [status]);
  const getSessionsXML = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/session/xml/${user.id}`, {
        method: "GET",
        headers: {
          "x-auth-key": authKey,
        },
      });

      if (response.status === 200) {
        const xmlText = await response.text();

        const newWindow = window.open();

        newWindow.document.write(
          `<pre>${xmlText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</pre>`
        );
        newWindow.document.close();
        // newWindow.document.open("text/xml");
        // newWindow.document.write(xmlText);
        // newWindow.document.close();
      } else {
        console.error("Failed to get XML:", response.status);
      }
    } catch (error) {
      console.error("Error fetching XML:", error);
    }
  };

  const getBookingsXML = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/booking/xml/${user.id}`, {
        method: "GET",
        headers: {
          "x-auth-key": authKey,
        },
      });

      if (response.status === 200) {
        const xmlText = await response.text();

        const newWindow = window.open();

        newWindow.document.write(
          `<pre>${xmlText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</pre>`
        );
        newWindow.document.close();
        // newWindow.document.open("text/xml");
        // newWindow.document.write(xmlText);
        // newWindow.document.close();
      } else {
        console.error("Failed to get XML:", response.status);
      }
    } catch (error) {
      console.error("Error fetching XML:", error);
    }
  };

  return (
    <main
      data-theme="light"
      className="w-full max-w-[430px] min-h-screen mx-auto shadow"
    >
      <header className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <h1 className="font-bold text-xl">{page}</h1>
        </div>

        <div className="flex-none">
          <button
            onClick={() => (user ? navigate("/user") : navigate("/"))}
            className={
              location.pathname == "/user"
                ? "dock-active btn btn-square btn-ghost"
                : "btn btn-square btn-ghost"
            }
          >
            <FaRegUser />
          </button>
          {location.pathname == "/trainer" && (
            <button
              onClick={() => getSessionsXML()}
              className={
                location.pathname == "/trainer"
                  ? "dock-active btn btn-square btn-primary"
                  : "btn btn-square btn-primary"
              }
            >
              <CiExport />
            </button>
          )}
          {location.pathname == "/booking" && (
            <button
              onClick={() => getBookingsXML()}
              className={
                location.pathname == "/booking"
                  ? "dock-active btn btn-square btn-primary"
                  : "btn btn-square btn-primary"
              }
            >
              <CiExport />
            </button>
          )}
        </div>
      </header>
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
        {user?.role == "member" && (
          <button
            onClick={() => navigate("/session")}
            className={location.pathname == "/session" ? "dock-active" : ""}
          >
            <span className="dock-label">
              <FaRegCalendarAlt className="text-2xl" />
            </span>
          </button>
        )}
        {user?.role == "member" && (
          <button
            onClick={() => navigate("/booking")}
            className={location.pathname == "/booking" ? "dock-active" : ""}
          >
            <span className="dock-label">
              <AiOutlineBell className="text-2xl" />
            </span>
          </button>
        )}
        {user?.role == "trainer" && (
          <button
            onClick={() => navigate("/trainer")}
            className={location.pathname == "/trainer" ? "dock-active" : ""}
          >
            <span className="dock-label">
              <AiOutlineBell className="text-2xl" />
            </span>
          </button>
        )}
      </nav>
    </main>
  );
}
export default Layout;
