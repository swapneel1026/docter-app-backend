import { Router } from "express";
import Docter from "../models/docter.model.js";
import { createToken } from "../helpers/authentication.js";
import { upload } from "../middlewares/multer.js";
import cloudinary from "../helpers/cloudinary.js";
import createHashPassword from "../helpers/PasswordEncrypter.js";

const router = Router();

// DOCTER SIGNUP
router.post(
  "/signup",
  upload.fields([
    { name: "docsImage", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
  ]),
  async (req, res) => {
    const {
      name,
      email,
      password,
      specialization,
      experience,
      currentLivingState,
      currentLivingCity,
    } = req.body;

    try {
      const hashedPassword = createHashPassword(password);
      if (
        !req.files ||
        !req.files["profileImage"] ||
        req.files["profileImage"].length === 0
      ) {
        return res
          .status(400)
          .json({ success: false, error: "Please upload a profile picture" });
      }

      const profileImage = req.files["profileImage"]?.[0];
      const docsImage = req.files["docsImage"]?.[0];
      let docsImageResponse;
      let profileImageResponse;

      if (profileImage !== undefined) {
        profileImageResponse = await cloudinary.uploader.upload(
          `${profileImage?.path}`,
          {
            folder: "uploads/docter",
            allowed_formats: ["png,jpeg,jpg,webp"],
            use_filename: true,
          }
        );
      } else {
        res
          .status(404)
          .json({ success: false, msg: "Please upload profile pic!!!" });
      }

      if (docsImage !== undefined) {
        docsImageResponse = await cloudinary.uploader.upload(
          `${docsImage?.path}`,
          {
            folder: "uploads/docter/docs",
            allowed_formats: ["png,jpeg,jpg,webp,pdf"],
            use_filename: true,
          }
        );
      }

      await Docter.create({
        name,
        email,
        password: hashedPassword,
        specialization,
        docsImage: docsImageResponse?.url || "",
        profileImage: profileImageResponse?.url || "",
        experience,

        currentLivingState,
        currentLivingCity,
      });
      return res
        .status(200)
        .json({ success: true, msg: "Successful signed up!" });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, error: err || "Internal Server Error" });
    }
  }
);

// DOCTER SIGNIN
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const docterHashedPassword = createHashPassword(password);
    const docter = await Docter.findOne({ email });

    if (!docter) {
      return res.status(404).json({ msg: "Docter not found! Check Email Id!" });
    }
    const docterPassword = await Docter.findOne({ email }).select("password");
    if (docterHashedPassword !== docterPassword?.password) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid Email/Password!" });
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

// UPDATE DOCTER PASSWORD
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
    const previousPassword = await Docter.findById(Id)
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
        .json({ success: false, msg: "Incorrect old password!" });
    }
    const passwordUpdate = await Docter.findByIdAndUpdate(Id, {
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
