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
import Docter from "./models/docter.model.js";

const app = express();
const port = process.env.PORT || 8000;

dbConnect();
const prodOrigins = [
  process.env.ORIGIN_1,
  process.env.ORIGIN_2,
  process.env.ORIGIN_3,
];
const devOrigin = "http://localhost:5173";
const allowedOrigins =
  process.env.NODE_ENV === "production" ? prodOrigins : devOrigin;
console.log(allowedOrigins, "allowedOrigins");
app.use(
  cors({
    origin: allowedOrigins,
    optionsSuccessStatus: 200,
    credentials: true,
    preflightContinue: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());

const verifyToken = (req, res, next) => {
  verifyCookie("token")(req, res, next);
};

// User
app.use("/api/user", verifyToken, user);
// Docter
app.use("/api/docter", verifyToken, docter);
//BookingAppointment
app.use("/api/booking", verifyToken, booking);

app.get("/healthcheck", async (req, res) => {
  try {
    const data = await Docter.find({}).limit(1);
    res.status(200).json({ data, msg: "Db working" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

// Booking Status update by Docter

app.listen(port, () => {
  console.log(`Server running on port:${port} `);
});
