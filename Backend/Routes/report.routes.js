import express from "express";
import { Donation } from "../Mongoose/Model/DonationSchema.js";
import { Request } from "../Mongoose/Model/RequestSchema.js";
import { Donor } from "../Mongoose/Model/DonorSchema.js";
import { Inventory } from "../Mongoose/Model/InventorySchema.js";
import { protect,authorize } from '../Middleware/Auth.js';


const router = express.Router()

router.get("/reports/inventory" ,protect, authorize('admin','technician'), async (req, res) => {
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

router.get("/reports/donations" ,protect, authorize('admin','technician'), async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments();

    const totalVolumeResult = await Donation.aggregate([
      {
        $group: {
          _id: null,
          total_ml: { $sum: "$quantity_ml" }
        }
      }
    ]);

    const totalVolume =
      totalVolumeResult.length > 0 ? totalVolumeResult[0].total_ml : 0;

    const monthlyStats = await Donation.aggregate([
      {
        $group: {
          _id: { $month: "$donation_date" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          monthNumber: "$_id",
          month: {
            $arrayElemAt: [
              ["", "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
              "$_id"
            ]
          },
          donations: "$count",
          _id: 0
        }
      },
      { $sort: { monthNumber: 1 } }
    ]);

    res.json({
      total_donations: totalDonations,
      total_volume_ml: totalVolume,
      monthly_stats: monthlyStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/reports/requests" ,protect, authorize('admin','technician'), async (req, res) => {
  try {
    // 1️⃣ STATUS SUMMARY
    const statusSummary = await Request.aggregate([
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
    ]);

    // 2️⃣ URGENCY SUMMARY
    const urgencySummary = await Request.aggregate([
      {
        $group: {
          _id: "$urgency",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          urgency: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    // 3️⃣ TOTAL UNITS REQUESTED
    const totalUnitsResult = await Request.aggregate([
      {
        $group: {
          _id: null,
          units: { $sum: "$units_needed" }
        }
      }
    ]);

    const totalUnitsRequested =
      totalUnitsResult.length > 0 ? totalUnitsResult[0].units : 0;

    // 4️⃣ FINAL RESPONSE
    res.json({
      status_summary: statusSummary,
      urgency_summary: urgencySummary,
      total_units_requested: totalUnitsRequested
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/reports/dashboard" ,protect, authorize('admin','technician'), async (req, res) => {
  try {
    const donors = await Donor.countDocuments();
    const donations = await Donation.countDocuments();
    const inventoryAvailable = await Inventory.countDocuments({ status: "available" });
    const pendingRequests = await Request.countDocuments({ status: "pending" });

    res.json({
      donors,
      donations,
      inventory_available: inventoryAvailable,
      pending_requests: pendingRequests
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router
