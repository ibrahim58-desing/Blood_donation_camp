import express from 'express'
import mongoose from 'mongoose'
import { inventoryValidationSchema } from '../Utils/InventoryValidationSchema.js'
import { Inventory } from '../Mongoose/Model/InventorySchema.js'
import { checkSchema, validationResult, matchedData } from 'express-validator'
import { calculateExpiryDate } from '../Utils/expiryCalculator.js'
import { Donor } from '../Mongoose/Model/DonorSchema.js'
import { v4 as uuidv4 } from "uuid";
import { protect,authorize } from '../Middleware/Auth.js';



const router = express.Router()

console.log("Registered Mongoose models:", mongoose.modelNames());


router.get('/inventory' ,protect, authorize('admin','technician'), async (req, res) => {
    try {

        const units = await Inventory.find()
            .populate("donor_id", "donor_code name");
           

        res.json(units);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/inventory/summary', async (req, res) => {

    try {
        const summary = await Inventory.aggregate([
            {
                $group: {
                    _id: "$blood_type",
                    count: { $sum: 1 }

                }
            }
        ])
        res.json(summary)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

})

router.get('/inventory/expiring',protect, authorize('admin','technician'), async (req, res) => {
    try {
        const today = new Date()
        const expire = new Date()
        expire.setDate(today.getDate() + 7)

        const expiring = await Inventory.find({
            status: "available",
            expiry_date: { $gte: today, $lte: expire }
        })

        res.json(expiring)

    } catch (err) {

        res.status(500).json({ error: err.message });
    }
})

router.post('/inventory/discard' , protect, authorize('admin'), async (req, res) => {

    try {
        const result = await Inventory.updateMany(
            { status: "expired" },
            { status: "discarded" }
        );

        res.json({
            message: "expired units discard",
            modified: result.modifiedCount
        })

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

})



router.get('/inventory/:id',protect, authorize('admin','technician'), async (req, res) => {

    try {
        const units = await Inventory.findById(req.params.id)
        if (!units)
            res.status(404).json({ error: "Inventory not found" })
        res.json(units)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

})

router.post('/inventory',protect, authorize('admin','technician'),
    checkSchema(inventoryValidationSchema),
    async (req, res) => {

        const errors = validationResult(req)

        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const data = matchedData(req)

        try {
            const donor = await Donor.findOne({ donor_code: data.donor_code })
            if (!donor) return res.status(404).json({ error: "donor not found" })

            data.blood_type = donor.blood_type
            data.donor_id = donor._id

            delete data.donor_code

            // Auto - generate unit number
            data.unit_number = `UNIT-${uuidv4().slice(0, 8)}`;


            // Calculate expiry date automatically
            data.expiry_date = calculateExpiryDate(data.collection_date, data.components);

            const newunit = new Inventory(data);
            await newunit.save();

            res.status(201).json(newunit);

        } catch (err) {
            res.status(400).json({ error: err.message });
        }

    })

router.put('/inventory/:id',protect, authorize('admin','technician'),
    checkSchema(inventoryValidationSchema),
    async (req, res) => {

        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const data = matchedData(req)

        try {
            const unit = await Inventory.findByIdAndUpdate(req.params.id, data, { new: true })

            if (!unit) return res.status(404).json({ error: "Inventory not found" });

            res.json({ message: "Updated successfully" });

        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
)

router.put(
  "/inventory/:id/status",protect, authorize('admin','technician'),
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const updated = await Inventory.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ error: "Inventory unit not found" });
      }

      res.json({
        message: "Status updated successfully",
        unit: updated
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


router.delete("/inventory/:id", protect, authorize('admin'), async (req, res) => {
    try {
        const deleted = await Inventory.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Unit not found" });
        }
        res.json({ message: "Unit removed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});






export default router;