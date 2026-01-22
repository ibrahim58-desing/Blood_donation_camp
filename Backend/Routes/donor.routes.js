import express from 'express';
import { v4 as uuidv4 } from "uuid";
import { Donor } from '../Mongoose/Model/DonorSchema';
import { Donation } from '../Mongoose/Model/DonationSchema';
import { checkSchema, validationResult, matchedData, param, query } from "express-validator"
import { donorvalidationschema } from '../Utils/DonorValidationSchema';

const router = express.Router()


/* Generate Donor Code */
const generateDonorCode = () => {
    return "DON-" + uuidv4().slice(0, 8);
};


router.get("/donors", async (req, res) => {

    try {
        const donors = await Donor.find();
        res.json(donors)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

router.get("/donors/:id", async (req, res) => {

    try {
        const donor = await Donor.findById(req.params.id)
        if (!donor) return res.status(404).json({ message: "Donor not found" })
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
        withMessage('Invalide donor ID format'),
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
                    runValidators: true
                }
            )
            if (!updatedonor) {
                return res.status(404).json({ message: "Donor not found" });
            }
            res.status(200).json(updatedonor);
        } catch (err) {
            return res.status(400).json({ error: err.message })
        }
    })

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

router.post("/donation", async (req, res) => {
    try {
        const { donor_id, donation_date, quantity_ml } = req.body;
        const donation = new Donation({
            donor_id,
            donation_date,
            quantity_ml
        })
        await donation.save()

        await Donor.findByIdAndUpdate(donor_id, {
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

router.get("/donors/search",
    query('blood_type')
        .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
        .withMessage('Invalid blood type'),

    query("phone")
        .optional()
        .isMobilePhone("en-IN")
        .withMessage("Invalid phone number"),

    query('name')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters'),

    async (req, res) => {
        // Validate query params
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract only validated data
        const filters = matchedData(req);

        try {
            // Build MongoDB query dynamically
            const queryObj = {};

            if (filters.blood_type) {
                queryObj.blood_type = filters.blood_type;
            }

            if (filters.phone) {
                queryObj.phone = filters.phone;
            }

            if (filters.name) {
                // Use regex for partial case-insensitive search
                queryObj.name = { $regex: filters.name, $options: "i" };
            }

            const donors = await Donor.find(queryObj);

            if (donors.length === 0) {
                return res.status(404).json({ message: "No donors found" });
            }

            res.json(donors);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);




export default router;