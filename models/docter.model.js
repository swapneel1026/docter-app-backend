import mongoose from "mongoose";

const DocterSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      default: "Docter",
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
    specialization: {
      type: Array,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    docsImage: {
      type: String,
      required: false,
    },
    profileImage: {
      type: String,
      required: [true, "Please upload your picture"],
    },
    currentLivingState: {
      type: String,
      required: true,
    },
    currentLivingCity: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Docter = mongoose.model("docter", DocterSchema);
export default Docter;
