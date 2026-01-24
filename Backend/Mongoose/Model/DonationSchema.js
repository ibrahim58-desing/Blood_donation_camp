import mongoose from "mongoose";

const DonationSchema=new mongoose.Schema({
    donor_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Donor",
        required:true

    },
    donation_date:{
        type:Date,
        required:true
    },
    quantity_ml:{
        type:Number,
        default:450
    }
},{timestamps:true})

export const Donation = mongoose.model("Donation",DonationSchema)