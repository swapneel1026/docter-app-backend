import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      default: "User",
    },
    name: {
      type: String,
      required: [true, "Feild is required!"],
    },
    email: {
      type: String,
      required: [true, "Feild is required!"],
      unique: true,
      index: [true, "Email id already exists!"],
    },
    password: {
      type: String,
      required: [true, "Feild is required!"],
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
