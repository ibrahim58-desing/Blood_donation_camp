import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema({
    unit_number: {
        type: String,
        unique: true,
        required: true,
    },
    donor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Donor_data",
        required: true,

    },
    blood_type: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true
    },
    components: {
        type: String,
        enum: ['whole_blood', 'rbc', 'plasma', 'platelets'],
        required: true,

    },
    volume_ml: {
        type: Number,
        required: true
    },
    collection_date: {
        type: Date,
        required: true
    },
    expiry_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        default: 'available'
    },

    storage_location: {
        type: String,
        required: true
    },
    test_result: {
        type: Object,
        default: {}
    }
},
    { timestamps: true }

);

export const Inventory = mongoose.model("Inventory", InventorySchema)