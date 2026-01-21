import express from 'express';
import { v4 as uuidv4 } from "uuid";
import { Donor } from '../Mongoose/Model/DonorSchema';
import { Donation } from '../Mongoose/Model/DonationSchema';
import { checkSchema, validationResult, matchedData, param } from "express-validator"
import { donorvalidationschema } from '../Utils/DonorValidationSchema';

const router = express.Router()


/* Generate Donor Code */
const generateDonorCode = () => {
    return "DON-" + uuidv4().slice(0, 8);
};


router.get("/donosr", async (req, res) => {

    try {
        const donors = await Donor.find();
        res.json(donors)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

router.get("/donors/:id", async (req, res) => {

    try {
        const donor = Donor.findById(req.params.id)
        if (!donor) return res.status(404).json({ messsage: "Donor not found" })
        res.json(donor)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})
router.post("/donors",
    checkSchema(donorvalidationschema),
    async (req, res) => {
        const check1 = validationResult(req)

        if (!check1.isEmpty()) {
            return res.status(400).json({ error: check1.array() })
        }

        const check2 = matchedData(req)

        try {
            const newdonor = new Donor({
                ...check2,
                donor_code: generateDonorCode()
            })

            await newdonor.save();
            res.status(201).json({ msg: "User is created" });
        }
        catch (err) {
            return res.status(400).json({ error: err.message })
        }
    })

router.put("/donors/:id",
    param("id").
        isMongoId().
        withMessage('Invalide donor ID format')),
    checkSchema(donorvalidationschema),
    async (req, res) => {

        const check1 = validationResult(req)

        if (!check1.isEmpty()) {
            return res.status(400).json({ error: check1.array() })
        }

        const check2 = matchedData(req)

        try {
            const updatedonor = await Donor.findByIdAndUpdate(
                req.params.id,
                check2,
                {
                    new: true,
                    runValidator: true
                }
            )
            if (!updatedonor) {
                return res.status(404).json({ message: "Donor not found" });
            }
            res.status(200).json(updatedonor);
        } catch (err) {
            return res.status(400).json({ error: err.message })
        }
    }

router.delete("/donors/:id", async (req, res) => {

    try {
        await Donor.findByIdAndDelete(req.params.id);
        res.json({ message: "Donor delete succresfully" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})

router.get("/donors/:id/donation", async (req, res) => {
    try {
        const donation = await Donation.find({ donor_id: req.params.id })
        res.json(donation);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.post("./donation", async (req, res) => {
    try {
        const { donor_id, donation_date, quantity_ml } = req.body;
        const donation = new Donation({
            donor_id,
            donation_date,
            quantity_ml
        })
        await donation.save()

        await Donor.findByIdAndUpdatedonor(donor_id, {
            last_donation: donation_date,
            $inc: { total_donations: 1 },
            is_eligible: false
        })
        res.status(201).json({ message: "Donation recorded successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }

})

router.get("/donors/eligible", async (req, res) => {
    try {
        const donor = await Donor.find({ is_eligible: true })
        res.json(donor)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

})

         

export default router;