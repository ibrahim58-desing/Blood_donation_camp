import express from 'express';
import { protect, authorize } from '../Middleware/auth.js';
import { Camp } from '../Mongoose/Model/CampSchema.js';

const router = express.Router();

// 1. CREATE a new camp (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const camp = new Camp({
            name: req.body.name,
            date: req.body.date,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            location: req.body.location,
            address: req.body.address,
            description: req.body.description
        });

        await camp.save();

        res.status(201).json({
            success: true,
            message: "Camp created successfully. All volunteers will be notified 2 days before.",
            camp: camp
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// 2. GET all camps
router.get('/', protect, authorize('admin', 'technician'), async (req, res) => {
    try {
        const camps = await Camp.find().sort({ date: 1 });
        
        res.json({
            success: true,
            count: camps.length,
            camps: camps
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// 3. GET upcoming camps
router.get('/upcoming', async (req, res) => {
    try {
        const today = new Date();
        const camps = await Camp.find({
            date: { $gte: today }
        }).sort({ date: 1 });
        
        res.json({
            success: true,
            camps: camps
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// 4. GET single camp
router.get('/:id', protect, authorize('admin', 'technician'), async (req, res) => {
    try {
        const camp = await Camp.findById(req.params.id);
        
        if (!camp) {
            return res.status(404).json({
                success: false,
                error: "Camp not found"
            });
        }

        res.json({
            success: true,
            camp: camp
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// 5. UPDATE camp
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const camp = await Camp.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                date: req.body.date,
                start_time: req.body.start_time,
                end_time: req.body.end_time,
                location: req.body.location,
                address: req.body.address,
                description: req.body.description
            },
            { new: true, runValidators: true }
        );

        if (!camp) {
            return res.status(404).json({
                success: false,
                error: "Camp not found"
            });
        }

        // Reset reminders_sent if date changed
        if (camp.date !== req.body.date) {
            camp.reminders_sent = false;
            await camp.save();
        }

        res.json({
            success: true,
            message: "Camp updated successfully",
            camp: camp
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// 6. DELETE camp
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const camp = await Camp.findByIdAndDelete(req.params.id);
        
        if (!camp) {
            return res.status(404).json({
                success: false,
                error: "Camp not found"
            });
        }

        res.json({
            success: true,
            message: "Camp deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// 7. Manual trigger to send reminders to ALL volunteers (Admin only)
router.post('/send-reminders/:campId', protect, authorize('admin'), async (req, res) => {
    try {
        const camp = await Camp.findById(req.params.campId);
        
        if (!camp) {
            return res.status(404).json({
                success: false,
                error: "Camp not found"
            });
        }

        const allVolunteers = await Volunteer.find({});
        
        if (allVolunteers.length === 0) {
            return res.status(400).json({
                success: false,
                error: "No volunteers registered"
            });
        }

        let sentCount = 0;
        for (const volunteer of allVolunteers) {
            await sendEmail(
                volunteer.email,
                `Test: Camp on ${new Date(camp.date).toLocaleDateString()}`,
                `<p>Test email for ${volunteer.name}</p>`
            );
            sentCount++;
        }

        res.json({
            success: true,
            message: `Sent test emails to ${sentCount} volunteers`
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

export default router;