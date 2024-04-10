import mongoose from "mongoose";

export function dbConnect() {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("db connected");
    })
    .catch((err) => {
      console.log("db not connected due to :", err);
    });
}
