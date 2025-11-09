import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import BlogPageView from "./assets/BlogPageView";
import SessionPageView from "./assets/SessionPageView";
import UserPage from "./assets/UserPageView";
import LoginView from "./assets/LoginView";
import Layout from "./common/Layout";
import BookingsPage from "./assets/BookingPageView";
const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { index: true, Component: LoginView },
      { path: "/blog", Component: BlogPageView },
      { path: "/session", Component: SessionPageView },
      { path: "/booking", Component: BookingsPage },
      { path: "/user", Component: UserPage },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
