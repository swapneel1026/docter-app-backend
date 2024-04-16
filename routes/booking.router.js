import { Router } from "express";
import Booking from "../models/bookappointment.model.js";
import { upload } from "../middlewares/multer.js";
import cloudinary from "../helpers/cloudinary.js";
import { extractFilenameFromUrl } from "../helpers/extracFilenameFromUrl.js";

const router = Router();

// CREATEBOOKING
router.post(
  "/bookappointment",
  upload.single("previousPrescriptionImage"),
  async (req, res) => {
    const {
      dateOfBooking,
      docter,
      bookedBy,
      reasonOfBooking,
      patientName,
      patientAge,
      refferedByDocter,
    } = req.body;

    try {
      let response;
      if (req.file) {
        response = await cloudinary.uploader.upload(req.file.path, {
          folder: `uploads/user/previousprescription/${bookedBy}/${patientName}`,
          use_filename: true,
          overwrite: true,
          allowedFormats: ["jpg", "png", "pdf"],
        });
      }
      await Booking.create({
        dateOfBooking,
        docter,
        bookedBy,
        reasonOfBooking,
        previousPrescriptionImage: response?.url || "",
        patientName,
        patientAge,
        refferedByDocter,
      });

      return res.status(200).json({ success: true, msg: "Booking Confirmed" });
    } catch (error) {
      res.send(error);
    }
  }
);
// FINDBOOKINGBYID
router.get("/bookingdetail/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
  const bookingDetails = await Booking.findById(bookingId)
    .populate("bookedBy", "name email")
    .populate("docter", "name email specialization")
    .lean();
  if (!bookingDetails) return res.status(404).json({ msg: "No booking found" });
  return res.send(bookingDetails);
});
// FINDBOOKINGBYDOCTERID
router.get("/findbookingdocter/:docterId", async (req, res) => {
  const { docterId } = req.params;

  try {
    const appointmentList = await Booking.find({ docter: docterId }).populate(
      "bookedBy"
    );
    return res.status(200).json({ data: appointmentList });
  } catch (error) {
    return res.send(error);
  }
});
// FINDBOOKINGBYUSER
router.get("/findbookinguser/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const appointmentList = await Booking.find({ bookedBy: userId }).populate(
      "docter"
    );
    return res.status(200).json({ data: appointmentList });
  } catch (error) {
    return res.send(error);
  }
});
// BOOKINGSTATUSUPDATE BY DOCTER
router.patch("/updatestatus/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
  const { bookingStatus } = req.body;
  try {
    const status = await Booking.findByIdAndUpdate(
      bookingId,
      {
        bookingStatus: bookingStatus,
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({ data: status });
  } catch (error) {
    res.send(error);
  }
});
// BOOKING DELETE BY USER
router.delete("/deletebooking", async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) {
    return res
      .status(400)
      .json({ success: false, msg: "Booking Id not found" });
  }
  try {
    const deleteBooking = await Booking.findByIdAndDelete(bookingId);
    let extractedFilename;
    let deleteRes;
    extractedFilename = extractFilenameFromUrl(
      deleteBooking?.previousPrescriptionImage
    );
    if (!deleteBooking) {
      res.status(404).json({ success: false, msg: "No bookings found" });
    } else {
      if (deleteBooking?.previousPrescriptionImage) {
        deleteRes = await cloudinary.uploader.destroy(
          `uploads/user/previousprescription/${deleteBooking?.bookedBy}/${deleteBooking?.patientName}/${extractedFilename}`
        );
        res.status(200).json({
          success: true,
          msg: "Successfully deleted Booking!",
          cloudinaryDelete: deleteRes?.result,
        });
      } else {
        res.status(200).json({
          success: true,
          msg: "Successfully deleted Booking!",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: error });
  }
});

export default router;
