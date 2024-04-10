import { Router } from "express";

import Booking from "../models/bookappointment.model.js";

const router = Router();

// CREATEBOOKING
router.post("/bookappointment", async (req, res) => {
  const {
    dateOfBooking,
    docter,
    bookedBy,
    reasonOfBooking,
    previousPrescriptionImage,
    patientName,
    patientAge,
    refferedByDocter,
  } = req.body;

  try {
    await Booking.create({
      dateOfBooking,
      docter,
      bookedBy,
      reasonOfBooking,
      previousPrescriptionImage,
      patientName,
      patientAge,
      refferedByDocter,
    });

    return res.status(200).json({ success: true, msg: "Booking Confirmed" });
  } catch (error) {
    res.send(error);
  }
});
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

export default router;
