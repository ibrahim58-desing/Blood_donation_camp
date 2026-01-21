import express from 'express';
import { v4 as uuidv4 } from "uuid";
import { Donor } from '../Mongoose/Model/DonorSchema';
import { Donation } from '../Mongoose/Model/Donation';

const router = express.Router()


/* Generate Donor Code */
const generateDonorCode = () => {
  return "DON-" + uuidv4();
};


router.get("/donor", async (req, res) => {
      
    try {
        const donors = await Donor.find();
        res.json(donors)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

router.get("/donor/:id", async (req, res) => {

    try {
        const donor = Donor.findById(req.params.id)
        if (!donor) return res.status(404).json({ messsage: "Donor not found" })
        res.json(donor)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})
router.post("/donor",async (req,res) => {


    
})
router.delete("/donors/:id",async (req,res) => {

    try {
        await Donor.findByIdAndDelete(req.params.id);
        res.json({message:"Donor delete succresfully"})
    } catch (err) {
         res.status(500).json({ error: err.message })
    }

})

router.get("/donor/:phone_no/donation",async (req,res) => {
    try {
        const donation= await Donation.find({phone_no:req.params.phone_no})
        res.json(donation);
    }  catch (err) {
         res.status(500).json({ error: err.message })
    }
})

export default router;