import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import BlogPageView from "./common/BlogPageView";
import LoginView from "./common/LoginView";

const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginView,
  },
  { path: "/blog", Component: BlogPageView },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
