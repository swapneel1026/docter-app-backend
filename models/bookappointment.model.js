import mongoose, { Schema } from "mongoose";

const BookAppointmentSchema = new mongoose.Schema(
  {
    dateOfBooking: {
      type: Date,
      required: true,
    },
    docter: {
      type: Schema.Types.ObjectId,
      ref: "docter",
    },
    bookedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    reasonOfBooking: {
      type: String,
      required: true,
    },
    previousPrescriptionImage: {
      type: String,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientAge: {
      type: String,
      required: true,
    },
    refferedByDocter: {
      type: String,
      required: false,
    },
    bookingStatus: {
      type: String,
      enum: ["Confirmed", "Pending", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("bookingappointment", BookAppointmentSchema);
export default Booking;
