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

router.get('/inventory/expiring', protect, authorize('admin', 'technician'), async (req, res) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0); // Set to UTC start of day
        
        const expire = new Date(today);
        expire.setUTCDate(today.getUTCDate() + 7);
        expire.setUTCHours(23, 59, 59, 999); // Set to UTC end of 7th day

        console.log('Searching for expiring units:');
        console.log('From:', today.toISOString());
        console.log('To:', expire.toISOString());

        const expiring = await Inventory.find({
            status: "available",
            expiry_date: { 
                $gte: today, 
                $lte: expire 
            }
        }).populate("donor_id", "donor_code name");

        console.log(`Found ${expiring.length} expiring units`);
        
        res.json(expiring);

    } catch (err) {
        console.error('Error in expiring units route:', err);
        res.status(500).json({ error: err.message });
    }
});

// TEMPORARY DEBUG ROUTE - Remove after testing
router.get('/inventory/debug/expiring', protect, authorize('admin', 'technician'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);

        // Get all units with their status and expiry
        const allUnits = await Inventory.find({})
            .populate("donor_id", "donor_code name")
            .sort({ expiry_date: 1 });

        const stats = {
            total: allUnits.length,
            byStatus: {},
            byBloodType: {},
            expiringStats: {
                today: 0,
                thisWeek: 0,
                nextWeek: 0,
                expired: 0
            }
        };

        allUnits.forEach(unit => {
            // Count by status
            stats.byStatus[unit.status] = (stats.byStatus[unit.status] || 0) + 1;
            
            // Count by blood type
            stats.byBloodType[unit.blood_type] = (stats.byBloodType[unit.blood_type] || 0) + 1;
            
            // Check expiry
            const expiryDate = new Date(unit.expiry_date);
            expiryDate.setHours(0, 0, 0, 0);
            
            if (expiryDate < today) {
                stats.expiringStats.expired++;
            } else if (expiryDate.getTime() === today.getTime()) {
                stats.expiringStats.today++;
                stats.expiringStats.thisWeek++;
            } else if (expiryDate <= nextWeek) {
                stats.expiringStats.thisWeek++;
            } else {
                stats.expiringStats.nextWeek++;
            }
        });

        // Get units that should be expiring
        const expiringUnits = allUnits.filter(unit => {
            const expiryDate = new Date(unit.expiry_date);
            expiryDate.setHours(0, 0, 0, 0);
            return unit.status === 'available' && 
                   expiryDate >= today && 
                   expiryDate <= nextWeek;
        });

        res.json({
            message: 'Debug information',
            stats,
            expiringCount: expiringUnits.length,
            expiringUnits: expiringUnits.map(u => ({
                unit_number: u.unit_number,
                blood_type: u.blood_type,
                status: u.status,
                expiry_date: u.expiry_date,
                days_until_expiry: Math.ceil((new Date(u.expiry_date) - today) / (1000 * 60 * 60 * 24))
            })),
            allUnits: allUnits.map(u => ({
                unit_number: u.unit_number,
                blood_type: u.blood_type,
                status: u.status,
                expiry_date: u.expiry_date
            }))
        });

    } catch (err) {
        console.error('Debug route error:', err);
        res.status(500).json({ error: err.message });
    }
});

// TEMPORARY TEST SCRIPT - Run this once to create test data
router.post('/inventory/test/create-expiring', protect, authorize('admin'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find a donor to use for test units
        const donor = await Donor.findOne();
        if (!donor) {
            return res.status(404).json({ error: "No donor found. Create a donor first." });
        }

        // Create test units with different expiry dates
        const testUnits = [
            {
                unit_number: `TEST-EXP-${Date.now()}-1`,
                donor_id: donor._id,
                blood_type: donor.blood_type,
                components: 'whole_blood',
                volume_ml: 450,
                collection_date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                expiry_date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
                status: 'available',
                storage_location: 'TEST-A1'
            },
            {
                unit_number: `TEST-EXP-${Date.now()}-2`,
                donor_id: donor._id,
                blood_type: donor.blood_type,
                components: 'rbc',
                volume_ml: 350,
                collection_date: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
                expiry_date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
                status: 'available',
                storage_location: 'TEST-B2'
            },
            {
                unit_number: `TEST-EXP-${Date.now()}-3`,
                donor_id: donor._id,
                blood_type: donor.blood_type,
                components: 'plasma',
                volume_ml: 250,
                collection_date: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
                expiry_date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
                status: 'available',
                storage_location: 'TEST-C3'
            }
        ];

        const created = await Inventory.insertMany(testUnits);
        
        console.log('Created test expiring units:', created);

        res.json({
            message: 'Test expiring units created',
            units: created
        });

    } catch (err) {
        console.error('Error creating test units:', err);
        res.status(500).json({ error: err.message });
    }
});

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