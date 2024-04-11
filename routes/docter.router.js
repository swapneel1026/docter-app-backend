import { Router } from "express";
import Docter from "../models/docter.model.js";
import { createToken } from "../helpers/authentication.js";
import { upload } from "../middlewares/multer.js";
import cloudinary from "../helpers/cloudinary.js";

const router = Router();

// DOCTER SIGNUP
router.post("/signup", upload.single("profileImage"), async (req, res) => {
  const {
    name,
    email,
    password,
    specialization,
    docsImage,
    experience,
    currentLivingState,
    currentLivingCity,
  } = req.body;
  try {
    const response = await cloudinary.uploader.upload(`${req.file.path}`, {
      folder: "uploads/docter",
      allowed_formats: ["png,jpeg,jpg,webp"],
      use_filename: true,
    });
    await Docter.create({
      name,
      email,
      password,
      specialization,
      docsImage,
      profileImage: response?.url,
      experience,
      currentLivingState,
      currentLivingCity,
    });
    return res
      .status(200)
      .json({ success: true, msg: "Successful signed up!" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

// DOCTER SIGNIN
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const docter = await Docter.findOne({ email, password });
    if (!docter) {
      return res.status(404).json({ msg: "Docter not found!" });
    }
    const docterToken = createToken(docter);
    if (docterToken !== false) {
      return res
        .cookie("token", docterToken, {
          expires: "2h",
          secure: true,
          sameSite: "none",
          httpOnly: true,
        })
        .status(201)
        .json({ success: true, msg: "Successfully signed in!" });
    } else {
      return res.status(404).json({ msg: "Invalid username/passoword" });
    }
  } catch (error) {
    return res.status(404).json({ msg: "User not found!!", error });
  }
});
// GET ALL DOCTERS LIST
router.get("/getalldocter", async (req, res) => {
  try {
    const allDocter = await Docter.find({});
    res.status(200).json({ data: allDocter });
  } catch (error) {
    res.send(error);
  }
});

export default router;
