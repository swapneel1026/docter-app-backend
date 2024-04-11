import { Router } from "express";
import User from "../models/user.model.js";
import { createToken } from "../helpers/authentication.js";
import { upload } from "../middlewares/multer.js";
import cloudinary from "../helpers/cloudinary.js";

const router = Router();

// USER SIGNUP
router.post("/signup", upload.single("profileImage"), async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let response;
    if (req.file) {
      response = await cloudinary.uploader.upload(req.file.path, {
        folder: "uploads/user",
        allowed_formats: ["png,jpeg,jpg,webp"],
        use_filename: true,
      });
    }

    await User.create({
      name,
      email,
      password,
      profileImage: response?.url || "",
    });
    return res
      .status(200)
      .json({ success: true, msg: "Successful signed up!" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// USER SIGNIN
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }
    const userToken = createToken(user);
    if (userToken !== false) {
      return res
        .cookie("token", userToken, { expires: "2h" })
        .status(201)
        .json({ success: true, msg: "Successfully signed in!" });
    } else {
      return res.status(404).json({ msg: "Invalid username/passoword" });
    }
  } catch (error) {
    return res.status(404).json({ msg: "User not found!!", error });
  }
});
export default router;
