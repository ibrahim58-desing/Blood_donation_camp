import mongoose from "mongoose";

const DonorSchema = new mongoose.Schema({
    donor_code: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    phone_no: {
        type: Number,
        unique: true,
        required: true
    },
    blood_type: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        required: true
    },
    date_of_birth: Date,
    gender: {
        type: String,
        enum: ["male", "female", "others"]
    },
    address: String,
    last_donation: Date,
    total_donations: {
        type: Number,
        default: null
    },
    is_eligible: {
        type: Boolean,
        default: null
    }
    },{ timeseries: true });


export const Donor = mongoose.model("Donor_data",DonorSchema)