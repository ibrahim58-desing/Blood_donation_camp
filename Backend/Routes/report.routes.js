import express from "express";
import mongoose from "mongoose";
import { Inventory } from "../Mongoose/Model/InventorySchema";

const router = express.Router()

router.get('/requests/inventory', async (req, res) => {
    try {
         const statusSummary = await Inventory.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    status: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ])
        const bloodGroupSummary = await Inventory.aggregate([
            {
                // Group by blood type and count units
                $group: {
                    _id: "$blood_type",
                    total_units: { $sum: 1 }
                }
            },
            {
                // Rename _id → blood_type and remove _id
                $project: {
                    blood_type: "$_id",
                    total_units: 1,
                    _id: 0
                }
            }
        ]);

         res.json({
        status_summary: statusSummary,
        blood_group_summary: bloodGroupSummary
    })

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})