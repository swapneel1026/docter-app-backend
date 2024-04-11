import express from "express";
import dotenv from "dotenv/config";
import bodyParser from "body-parser";
import { dbConnect } from "./helpers/MongoConnection.js";
import cors from "cors";
import user from "./routes/user.router.js";
import docter from "./routes/docter.router.js";
import booking from "./routes/booking.router.js";
import cookieParser from "cookie-parser";
import { verifyCookie } from "./helpers/AuthVerifyToken.js";

const app = express();
const port = process.env.PORT || 8000;

dbConnect();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: ["*"],
    methods: ["*"],
    allowedHeaders: ["*"],
    exposedHeaders: ["*"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(verifyCookie("token"));

// User
app.use("/api/user", user);
// Docter
app.use("/api/docter", docter);
//BookingAppointment
app.use("/api/booking", booking);

// Booking Status update by Docter

app.listen(port, () => {
  console.log(`Server running on port:${port} `);
});
