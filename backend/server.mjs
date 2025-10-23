import express from "express";
import path from "path";
import { BlogController } from "./controllers/BlogController.mjs";
import { AuthenticationController } from "./controllers/Authentication.mjs";
import { UserController } from "./controllers/UserController.mjs";
import { SessionController } from "./controllers/SessionController.mjs";
import { BookingController } from "./controllers/BookingController.mjs";
import { CalendarController } from "./controllers/CalendarController.mjs";
import { ItemsController } from "./controllers/A_LController.mjs";
import { SessionModel } from "./models/SessionModel.mjs";
import { APIController } from "./controllers/api/ApiController.mjs";

const app = express();
const port = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(import.meta.dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(import.meta.dirname, "public")));
app.use(express.static(path.join(import.meta.dirname, "dist")));
//SETUP MIDDLEWARE
app.use(AuthenticationController.middleware);
//SETUP ROUTES
app.use("/blog", BlogController.routes);
app.use("/auth", AuthenticationController.routes);
app.use("/users", UserController.routes);
app.use("/session", SessionController.routes);
app.use("/bookings", BookingController.routes);
app.use("/calendar", CalendarController.routes);
app.use("/sessionItems", ItemsController.routes);
app.use("/api", APIController.routes);
app.get("/", (req, res) => {
  SessionModel.markExpiredSessionsDeleted();
  res.status(301).redirect("/auth");
});

app.listen(port, () => {
  console.log("Backend started on http://localhost:" + port);
});
