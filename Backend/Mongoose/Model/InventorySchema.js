import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema({
    unit_number: {
        type: String,
        unique: true,
        required: true,
    },
    donor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Donor",
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
        require: true,

    },
    volume_ml : {
        type: Number,
        required: true
    },     
    collection_data:{
        type:Date,
        required:true
    },
    expiry_data:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        enum:['available','reserved','used','required','expired','discard'],
        default:'available'
    },
    storage_location:{
        type:String,
        required:true
    },
    test_result:{
        type:Object,
        default:{}
    }
},
    {timestamps:true}
     
);

export const Inventory=mongoose.model("Inventory",InventorySchema)