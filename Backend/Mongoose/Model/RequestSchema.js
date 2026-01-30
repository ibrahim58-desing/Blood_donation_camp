import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
  {
    request_code: {
      type: String,
      unique: true,
      required: true
    },

    requester_name: {
      type: String,
      required: true,
      trim: true
    },

    requester_contact: {
      type: String,
      required: true
    },

    hospital_name: {
      type: String,
      required: true,
      trim: true
    },

    patient_name: {
      type: String,
      trim: true
    },

    blood_type: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true
    },

    units_needed: {
      type: Number,
      required: true,
      min: 1
    },

    urgency: {
      type: String,
      enum: ["normal", "urgent", "critical"],
      default: "normal"
    },

    status: {
      type: String,
      enum: ["pending", "approved", "fulfilled", "rejected", "cancelled"],
      default: "pending"
    },

    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User" // admin / technician
    },

    notes: {
      type: String
    }
  },
  { timestamps: true }
);

export const Request = mongoose.model("Request", RequestSchema);
