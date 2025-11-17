import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import BlogPageView from "./assets/BlogPageView";
import SessionPageView from "./assets/SessionPageView";
import UserPage from "./assets/UserPageView";
import LoginView from "./authentication/LoginView";
import Layout from "./common/Layout";
import BookingsPage from "./assets/BookingPageView";
import TrainerSessionPage from "./assets/TrainerSessionPage";
import HelloContext from "./common/HelloContext";
import { AuthenticationProvider } from "./authentication/useAuthenticate";
const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { index: true, Component: LoginView },
      { path: "/blog", Component: BlogPageView },
      { path: "/session", Component: SessionPageView },
      { path: "/booking", Component: BookingsPage },
      { path: "/user", Component: UserPage },
      { path: "/trainer", Component: TrainerSessionPage },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthenticationProvider>
      <RouterProvider router={router} />
    </AuthenticationProvider>
  </StrictMode>
);
