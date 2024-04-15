import { Router } from "express";
import User from "../models/user.model.js";
import { createToken } from "../helpers/authentication.js";
import { upload } from "../middlewares/multer.js";
import cloudinary from "../helpers/cloudinary.js";
import createHashPassword from "../helpers/PasswordEncrypter.js";

const router = Router();

// USER SIGNUP
router.post("/signup", upload.single("profileImage"), async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = createHashPassword(password);
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
      password: hashedPassword,
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
  const userHashedPassword = createHashPassword(password);
  try {
    const user = await User.findOne({ email });
    if (user === null) {
      return res
        .status(404)
        .json({ msg: "User not found! Check Email Id!", user });
    }
    const userPassword = await User.findOne({ email }).select("password");
    if (userHashedPassword !== userPassword?.password) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid Email/Password!" });
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
router.patch(
  "/updateprofile",
  upload.single("profileImage"),
  async (req, res) => {
    const { name, password, userId } = req.body;
    let urlProfileImage;
    let urlPassword;
    const hashedPassword = createHashPassword(password);

    try {
      if (!hashedPassword) {
        return res
          .status(404)
          .json({ success: false, msg: "Enter Password to confirm changes!" });
      } else {
        urlPassword = await User.findById(userId).lean().select("password");
      }
      let response;
      if (req.file) {
        response = await cloudinary.uploader.upload(req.file.path, {
          folder: "uploads/user",
          allowed_formats: ["png,jpeg,jpg,webp"],
          use_filename: true,
          overwrite: true,
        });
      } else {
        urlProfileImage = await User.findById(userId)
          .lean()
          .select("profileImage");
      }
      if (hashedPassword != urlPassword?.password) {
        return res
          .status(401)
          .json({ success: false, msg: "Incorrect Password, Try again!" });
      } else {
        let user = await User.findByIdAndUpdate(userId, {
          name,
          profileImage: response?.url || urlProfileImage?.profileImage,
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

// UPDATE USER PASSWORD
router.patch("/updatepassword", async (req, res) => {
  const { password, newPassword, Id } = req.body;
  try {
    if (!Id) {
      return res
        .status(400)
        .json({ success: false, msg: "Login and try again!" });
    }
    if (password === newPassword) {
      return res
        .status(406)
        .json({ success: false, msg: "Old and new password cant be same." });
    }
    const previousPassword = await User.findById(Id)
      .select("password")
      .select("_id");

    if (!previousPassword) {
      return res
        .status(400)
        .json({ success: false, msg: "User doesnt exist !" });
    }

    if (previousPassword && !previousPassword?.password) {
      return res
        .status(400)
        .json({ success: false, msg: "Login and try again!" });
    }
    const hashedPassword = createHashPassword(password);
    const newHashedPassword = createHashPassword(newPassword);
    if (hashedPassword !== previousPassword?.password) {
      return res
        .status(400)
        .json({ success: false, msg: "Password mismatch!" });
    }
    const passwordUpdate = await User.findByIdAndUpdate(Id, {
      password: newHashedPassword,
    });
    if (passwordUpdate) {
      return res
        .status(202)
        .json({ success: true, msg: "Password Succesfully changed!" });
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/me", (req, res) => {
  const cookieValue = req.cookies.token;
  if (cookieValue) {
    res.status(200).json({ cookie: true, cookieValue });
  } else {
    res
      .status(401)
      .json({ cookie: false, cookieValue: null, msg: "No cookie found" });
  }
});

export default router;
