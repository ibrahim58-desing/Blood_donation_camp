import express from 'express'
import { inventoryValidationSchema } from '../Utils/InventoryValidationSchema.js'
import { Inventory } from '../Mongoose/Model/InventorySchema.js'
import { checkSchema, validationResult, matchData, matchedData } from 'express-validator'
import { calculateExpiryDate } from '../Utils/expiryCalculator.js'

const router = express.Router()

router.get('/inventory', async (req, res) => {
    try {
        const units = await Inventory.find("donor_id", "donor_code name");
        res.json(units)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.get('/inventory/:id', async (req, res) => {

    try {
        const units = await Inventory.findById(req.parms.id)
        if (!units)
            res.status(404).json({ error: "Inventory not found" })
        res.json(units)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

})

router.post('/inventory',
    checkSchema(inventoryValidationSchema),
    async (req, res) => {

        const errors = validationResult(req)

        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const data = matchData(req)

        try {
             // Calculate expiry date automatically
            data.expiry_date = calculateExpiryDate(data.collection_date, data.component);

            const newunit = new Inventory(data);
            await newunit.save();

            res.status(201).json(newunit);

        } catch (err) {
            res.status(400).json({ error: err.message });
        }

    })

router.post('/inventory/:id',
    checkSchema(inventoryValidationSchema),
    async (req, res) => {

        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const data = matchedData(req)

        try {
            const unit = await Inventory.findByIdAndUpdate(req.parms.id, data, { new: true })

            if (!unit) return res.status(404).json({ error: "Inventory not found" });

            res.json(unit);

        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
)   

router.delete("/inventory/:id", async (req, res) => {
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

router.get('/inventory/summary',async (req,res) => {

    try {
        const summary =await Inventory.aggregate([
            {$group:{
                _id:"@blood_type",
                    count:{$sum:1}
                
            }}
        ])
        res.json(summary)
    } catch (err) {
         res.status(500).json({ error: err.message });
    }
    
})

router.get('/inventory/expiring',async (req,res) => {
    try {
        const today =new Date()
        const expire = new Date()
        expire.setdate(today.getdate()+7)

        const expiring =await Inventory.find({
           status:"available",
           expiry_data:{$gte:today,$lte:expire} 
        })

        res.json(expiring)

    } catch (err) {

         res.status(500).json({ error: err.message });
    }
})