import express from 'express';
import { v4 as uuidv4 } from "uuid";
import { Donor } from '../Mongoose/Model/DonorSchema.js';
import { Donation } from '../Mongoose/Model/DonationSchema.js';
import { checkSchema, validationResult, matchedData, param, query } from "express-validator"
import { donorvalidationschema } from '../Utils/DonorValidationSchema.js';
import { protect,authorize } from '../Middleware/Auth.js';


const router = express.Router();


/* Generate Donor Code */
const generateDonorCode = () => {
    return "DON-" + uuidv4().slice(0, 8);
};


router.get("/donors" , protect, authorize('admin','technician'), async (req, res) => {

    try {
        const donors = await Donor.find();
        res.json(donors)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

router.get("/donors/search", protect, authorize('admin','technician'),
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

router.get("/donors/eligible", protect, authorize('admin','technician'), async (req, res) => {
    try {
        const donor = await Donor.find({ is_eligible: true })
        res.status(200).json(donor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

})
   


router.get("/donors/:donor_code", protect, authorize('admin','technician'), async (req, res) => {

    try {
        const donor = await Donor.findOne({donor_code: req.params.donor_code })
        if (!donor) return res.status(404).json({ message: "Donor not found" })
        res.json(donor)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})
router.post("/donors", protect, authorize('admin','technician'),
    checkSchema(donorvalidationschema),
    async (req, res) => {
        const check1 = validationResult(req)

        if (!check1.isEmpty()) {
            return res.status(400).json({ error: check1.array() })
        }

        const check2 = matchedData(req)

        const donorData = {
            ...check2,
            donor_code: generateDonorCode()
        };

        // Convert date_of_birth from DD/MM/YYYY to Date
        if (donorData.date_of_birth) {
            const [day, month, year] = donorData.date_of_birth.split('/');
            donorData.date_of_birth = new Date(`${year}-${month}-${day}`);
        }

        // Convert last_donation from DD/MM/YYYY to Date (if provided)
        if (donorData.last_donation) {
            const [day, month, year] = donorData.last_donation.split('/');
            donorData.last_donation = new Date(`${year}-${month}-${day}`);
        }


        try {
            // ✅ FIXED: Use donorData, not check2!
            const newdonor = new Donor(donorData);
            await newdonor.save();
            res.status(201).json({ msg: "User is created" });
        }
        catch (err) {
            return res.status(400).json({ error: err.message })
        }
    })

router.put(
  "/donors/:donor_code",
  protect, authorize('admin','technician'),
  // validate donor_code properly
  param("donor_code")
    .notEmpty()
    .withMessage("Donor code is required"),

  checkSchema(donorvalidationschema),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const data = matchedData(req);

    try {
      const updatedDonor = await Donor.findOneAndUpdate(
        { donor_code: req.params.donor_code }, 
        data,
        {
          new: true,
          runValidators: true
        }
      );

      if (!updatedDonor) {
        return res.status(404).json({ message: "Donor not found" });
      }

      res.status(200).json(updatedDonor);

    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);


router.delete("/donors/:donor_code", protect, authorize('admin'), async (req, res) => {

    try {
        await Donor.findOneAndDelete({donor_code: req.params.donor_code});
        res.json({ message: "Donor delete succresfully" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})

router.get("/donors/:donor_code/donation", protect, authorize('admin','technician'), async (req, res) => {
    try {
        const donor = await Donor.findOne({ donor_code:req.params.donor_code })
        if (!donor){
            return res.status(404).json({message:"donor not found"})
        }

        const donation =await Donation.find({donor_id:donor._id})
      
        
        res.json(donation);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.post("/donors/:donor_code/donate", protect, authorize('admin','technician'), async (req, res) => {
    try {
        const { donor_code, donation_date, quantity_ml } = req.body;

        const donor = await Donor.findOne({ donor_code })
        if (!donor){
            return res.status(404).json({message:"donor not found"})
        }

        const donation = new Donation({
           donor_id:donor._id,
            donation_date,
            quantity_ml
        })
        await donation.save()

            
            donor.last_donation= donation_date;
            donor.total_donations +=1;
            donor.is_eligible = false;

            await donor.save();
      
        res.status(201).json({ message: "Donation recorded successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }

})






export default router;