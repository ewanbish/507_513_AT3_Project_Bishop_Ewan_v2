import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import BlogPageView from "./assets/BlogPageView";
import LoginView from "./assets/LoginView";
import Layout from "./common/Layout";
const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { index: true, Component: LoginView },
      { path: "/blog", Component: BlogPageView },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
