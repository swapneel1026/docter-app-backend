import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      default: "User",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", UserSchema);

export default User;
