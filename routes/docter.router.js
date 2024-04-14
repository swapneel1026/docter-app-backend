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
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "Please upload a profile picture" });
    }
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
    return res
      .status(500)
      .json({ success: false, error: err || "Internal Server Error" });
  }
});

// DOCTER SIGNIN
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const docter = await Docter.findOne({ email, password });
    console.log(docter, "doc");
    if (!docter) {
      return res.status(404).json({ msg: "Docter not found!" });
    }
    const docterToken = createToken(docter);
    if (docterToken !== false) {
      return res
        .cookie("token", docterToken, {
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
    return res.send(error);
  }
});
// UPDATE DOCTER PROFILE
router.patch(
  "/updateprofile",
  upload.single("profileImage"),
  async (req, res) => {
    const {
      name,
      password,
      specialization,
      experience,
      currentLivingCity,
      currentLivingState,
      docterId,
    } = req.body;
    let urlProfileImage;
    let urlPassword;
    try {
      if (!password) {
        return res
          .status(401)
          .json({ success: false, msg: "Enter Password to confirm changes!" });
      } else {
        urlPassword = await Docter.findById(docterId).lean().select("password");
      }
      let response;
      if (req.file) {
        response = await cloudinary.uploader.upload(req.file.path, {
          folder: "uploads/docter",
          allowed_formats: ["png,jpeg,jpg,webp"],
          use_filename: true,
          overwrite: true,
        });
      } else {
        urlProfileImage = await Docter.findById(docterId)
          .lean()
          .select("profileImage");
      }

      if (password !== urlPassword?.password) {
        return res
          .status(401)
          .json({ success: false, msg: "Incorrect Password, Try again!" });
      } else {
        let docter = await Docter.findByIdAndUpdate(docterId, {
          name,
          specialization,
          experience,
          currentLivingCity,
          currentLivingState,
          profileImage: response?.url || urlProfileImage?.profileImage,
        });

        if (!docter)
          res.status(400).json({ success: false, msg: "No docter Found" });
        if (docter) {
          let updatedDocter = await Docter.findById(docterId);
          const docterToken = createToken(updatedDocter);

          if (docterToken !== false) {
            return res
              .cookie("token", docterToken, {
                secure: true,
                sameSite: "none",
                httpOnly: true,
                maxAge: 12000000,
              })
              .status(201)
              .json({
                success: true,
                msg: "Successfully Updated Profile!",
                cookieValue: docterToken,
              });
          }
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error: error });
    }
  }
);
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
