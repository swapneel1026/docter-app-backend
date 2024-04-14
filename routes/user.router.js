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
    return res.status(500).json({ success: false, error: error });
  }
});

// USER SIGNIN
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user === null) {
      return res
        .status(404)
        .json({ msg: "User not found! Check email/password", user });
    }
    const userToken = createToken(user);
    if (userToken !== false) {
      return res
        .cookie("token", userToken, {
          secure: true,
          sameSite: "none",
          httpOnly: true,
          maxAge: 12000000,
        })
        .status(201)
        .json({
          success: true,
          msg: "Successfully signed in!",
        });
    } else {
      return res.status(404).json({ msg: "Invalid username/passoword" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Kuch error hai", error });
  }
});
router.post(
  "/updateprofile",
  upload.single("profileImage"),
  async (req, res) => {
    const { name, password, userId } = req.body;
    let url;

    try {
      let response;
      if (req.file) {
        response = await cloudinary.uploader.upload(req.file.path, {
          folder: "uploads/user",
          allowed_formats: ["png,jpeg,jpg,webp"],
          use_filename: true,
          overwrite: true,
        });
      } else {
        url = await User.findById(userId)
          .lean()
          .select("profileImage")
          .select("password");
      }
      if (!password) {
        return res
          .status(404)
          .json({ success: false, msg: "Enter Password to confirm changes!" });
      } else if (password != url?.password) {
        return res
          .status(401)
          .json({ success: false, msg: "Incorrect Password, Try again!" });
      } else {
        let user = await User.findByIdAndUpdate(userId, {
          name,
          password,
          profileImage: response?.url || url?.profileImage,
        });
        if (user) {
          let updatedUser = await User.findById(userId);
          const userToken = createToken(updatedUser);

          if (userToken !== false) {
            return res
              .cookie("token", userToken, {
                secure: true,
                sameSite: "none",
                httpOnly: true,
                maxAge: 12000000,
              })
              .status(201)
              .json({
                success: true,
                msg: "Successfully Updated Profile!",
                cookieValue: userToken,
              });
          }
        }
      }
    } catch (error) {
      return res.status(500).json({ success: false, error: error });
    }
  }
);

router.get("/me", (req, res) => {
  const cookieValue = req.cookies.token;
  console.log(cookieValue);
  if (cookieValue) {
    res.status(200).json({ cookie: true, cookieValue });
  } else {
    res
      .status(401)
      .json({ cookie: false, cookieValue: null, msg: "No cookie found" });
  }
});
export default router;
