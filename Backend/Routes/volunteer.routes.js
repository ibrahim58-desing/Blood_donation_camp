// routes/volunteerRoutes.js
import express from 'express';
import { checkSchema } from 'express-validator';
import { protect, authorize } from '../Middleware/Auth.js';
import { volunteerValidationSchema } from '../Utils/volunteerValidation.js';
import { sendEmail } from '../Utils/emailService.js';
import {Volunteer} from '../Mongoose/Model/VolunteerSchema.js';
import { volunteerReminderTemplate } from '../Utils/emailTemplates.js';
import { Camp } from '../Mongoose/Model/CampSchema.js';

const router = express.Router();

// 1. POST /api/volunteers/register - Register Volunteer (Public)
router.post('/register', checkSchema(volunteerValidationSchema), async (req, res) => {
    try {
        // Check if volunteer exists
        const existingVolunteer = await Volunteer.findOne({ email: req.body.email });
        if (existingVolunteer) {
            return res.status(400).json({ 
                success: false,
                error: "Volunteer with this email already exists" 
            });
        }

        // Create new volunteer
        const volunteer = new Volunteer({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode
        });

        await volunteer.save();
        
        res.status(201).json({
            success: true,
            message: "Volunteer registered successfully",
            volunteer: {
                id: volunteer._id,
                name: volunteer.name,
                email: volunteer.email,
                phone: volunteer.phone
            }
        });
        
    } catch (err) {
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
});

// Add this temporary route to your volunteerRoutes.js for testing
// REMOVE AFTER TESTING!

// TEST ROUTE - Send test email
router.get('/test-email', async (req, res) => {
    try {
        const testResult = await sendEmail(
            'your-email@gmail.com', // Change to your email
            '🧪 Test Email from Blood Bank System',
            `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #f0f9ff; border-radius: 10px;">
                <h2 style="color: #dc2626;">✅ Email Service Test</h2>
                <p>If you received this email, your email configuration is working correctly!</p>
                <p>Time sent: ${new Date().toLocaleString()}</p>
                <hr>
                <p style="color: #666;">Blood Bank Management System</p>
            </div>
            `
        );

        if (testResult.success) {
            res.json({
                success: true,
                message: 'Test email sent successfully! Check your inbox.',
                details: testResult
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send test email',
                error: testResult.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// DEBUG ROUTE - Check date calculation
router.get('/debug-dates', protect, authorize('admin'), async (req, res) => {
    try {
        const today = new Date();
        const reminderDate = new Date();
        reminderDate.setDate(today.getDate() + 2);
        
        const startOfDay = new Date(reminderDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(reminderDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        // Get all camps
        const allCamps = await Camp.find({});
        
        // Find camps that SHOULD match
        const matchingCamps = await Camp.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        });
        
        res.json({
            today: today.toISOString(),
            looking_for_date: reminderDate.toISOString().split('T')[0],
            start_of_day: startOfDay.toISOString(),
            end_of_day: endOfDay.toISOString(),
            all_camps: allCamps.map(camp => ({
                name: camp.name,
                date: camp.date,
                date_string: new Date(camp.date).toISOString().split('T')[0],
                reminders_sent: camp.reminders_sent
            })),
            matching_camps: matchingCamps.map(c => c.name),
            camps_found: matchingCamps.length
        });
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// FIXED: trigger-cron route
router.post('/trigger-cron', protect, authorize('admin'), async (req, res) => {
    try {
        console.log("🔍 Manually triggering volunteer reminder cron...");
        
        const today = new Date();
        const reminderDate = new Date();
        reminderDate.setDate(today.getDate() + 2);
        
        const startOfDay = new Date(reminderDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(reminderDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        console.log("Looking for camps between:", startOfDay, "and", endOfDay);
        
        // Find camps happening in 2 days
        const upcomingCamps = await Camp.find({
            date: { $gte: startOfDay, $lte: endOfDay },
            reminders_sent: false
        });
        
        console.log(`📅 Found ${upcomingCamps.length} camps`);
        
        if (upcomingCamps.length === 0) {
            return res.json({
                success: true,
                message: "No camps found for the target date",
                camps_found: 0,
                emails_sent: 0
            });
        }
        
        // Get ALL volunteers from database
        const allVolunteers = await Volunteer.find({});
        console.log(`👥 Found ${allVolunteers.length} volunteers in database`);
        
        if (allVolunteers.length === 0) {
            return res.json({
                success: true,
                message: "No volunteers found in database",
                camps_found: upcomingCamps.length,
                emails_sent: 0
            });
        }
        
        let totalSent = 0;
        let failedEmails = [];
        
        for (const camp of upcomingCamps) {
            console.log(`📧 Sending emails for camp: ${camp.name}`);
            
            for (const volunteer of allVolunteers) {
                try {
                    // Create email content
                    const campDate = new Date(camp.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    const emailHtml = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; }
                                .container { max-width: 600px; margin: 20px auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
                                .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center; color: white; }
                                .content { padding: 30px; background: #f9fafb; }
                                .camp-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
                                .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🩸 Blood Donation Camp</h1>
                                    <p>Volunteer Opportunity</p>
                                </div>
                                
                                <div class="content">
                                    <p>Dear <strong>${volunteer.name}</strong>,</p>
                                    <p>We have an upcoming blood donation camp in <strong>2 days</strong> and need your valuable support!</p>
                                    
                                    <div class="camp-details">
                                        <h3 style="margin-top: 0;">📋 Camp Details</h3>
                                        <p><strong>Camp:</strong> ${camp.name}</p>
                                        <p><strong>Date:</strong> ${campDate}</p>
                                        <p><strong>Time:</strong> ${camp.start_time} - ${camp.end_time}</p>
                                        <p><strong>Location:</strong> ${camp.location}</p>
                                        <p><strong>Address:</strong> ${camp.address}</p>
                                        ${camp.description ? `<p><strong>Description:</strong> ${camp.description}</p>` : ''}
                                    </div>
                                    
                                    <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                        <p style="margin: 0;"><strong>⚠️ Please arrive 30 minutes early for briefing</strong></p>
                                    </div>
                                    
                                    <p>Thank you for your valuable contribution! ❤️</p>
                                    <p>Best regards,<br>Blood Bank Team</p>
                                </div>
                                
                                <div class="footer">
                                    <p>© 2026 Blood Bank Management System</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `;

                    console.log(`Sending to: ${volunteer.email} (${volunteer.name})`);
                    
                    const result = await sendEmail(
                        volunteer.email,
                        `🔔 Volunteer Needed: Blood Donation Camp on ${campDate}`,
                        emailHtml
                    );
                    
                    if (result.success) {
                        totalSent++;
                        console.log(`  ✅ Sent to ${volunteer.name}`);
                    } else {
                        failedEmails.push({
                            name: volunteer.name,
                            email: volunteer.email,
                            error: result.error
                        });
                        console.log(`  ❌ Failed to send to ${volunteer.name}: ${result.error}`);
                    }
                    
                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (emailErr) {
                    console.error(`Error sending to ${volunteer.email}:`, emailErr.message);
                    failedEmails.push({
                        name: volunteer.name,
                        email: volunteer.email,
                        error: emailErr.message
                    });
                }
            }
            
            // Mark camp as reminders sent
            camp.reminders_sent = true;
            await camp.save();
            console.log(`✅ Camp "${camp.name}" marked as reminders sent`);
        }
        
        res.json({
            success: true,
            message: `Cron job triggered manually`,
            camps_found: upcomingCamps.length,
            emails_sent: totalSent,
            total_volunteers: allVolunteers.length,
            failed_count: failedEmails.length,
            failed_details: failedEmails.length > 0 ? failedEmails : undefined
        });
        
    } catch (error) {
        console.error("❌ Error in trigger-cron:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// TEST ROUTE - Send a test email
router.get('/send-test-email', async (req, res) => {
    try {
        const result = await sendEmail(
            'ciribu58@gmail.com', // Replace with YOUR email address
            '✅ Test Email from Blood Bank',
            `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                    .content { background: white; padding: 30px; border-radius: 8px; }
                    h1 { color: #667eea; margin-top: 0; }
                    .success { color: #10b981; font-size: 24px; text-align: center; padding: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="content">
                        <h1>🎉 Email Test Successful!</h1>
                        <p>Dear Admin,</p>
                        <p>This email confirms that your email configuration is working correctly.</p>
                        <div class="success">✅ Email Service is Ready</div>
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Server:</strong> Blood Bank Management System</p>
                        <hr>
                        <p style="color: #666; font-size: 12px;">This is a test email. No action required.</p>
                    </div>
                </div>
            </body>
            </html>
            `
        );

        if (result.success) {
            res.json({
                success: true,
                message: 'Test email sent successfully! Check your inbox.',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send test email',
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add to volunteerRoutes.js - Create test data
router.post('/create-test-data',  async (req, res) => {
    try {
        // Create a test volunteer if not exists
        let volunteer = await Volunteer.findOne({ email: 'test@example.com' });
        
        if (!volunteer) {
            volunteer = await Volunteer.create({
                name: 'Santhiya',
                email: 'santhiyaramar1984@gmail.com', // Your email
                phone: '9876543210',
                address: '123 Test St',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001'
            });
        }
        
        // Create a test camp for day after tomorrow
        const campDate = new Date();
        campDate.setDate(campDate.getDate() + 2);
        
        const camp = await Camp.create({
            name: 'Test Blood Donation Camp',
            date: campDate,
            start_time: '09:00 AM',
            end_time: '05:00 PM',
            location: 'Community Hall, Andheri East',
            volunteers: [volunteer._id],
            reminders_sent: false
        });
        
        res.json({
            success: true,
            message: 'Test data created!',
            data: {
                volunteer: volunteer,
                camp: camp,
                next_reminder: campDate.toLocaleDateString()
            }
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 2. GET /api/volunteers - Get All Volunteers (Admin/Technician)
router.get('/', protect, authorize('admin', 'technician'), async (req, res) => {
    try {
        const volunteers = await Volunteer.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: volunteers.length,
            volunteers: volunteers
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
});

// 3. GET /api/volunteers/:id - Get Single Volunteer (Admin/Technician)
router.get('/:id', protect, authorize('admin', 'technician'), async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);
        
        if (!volunteer) {
            return res.status(404).json({ 
                success: false,
                error: "Volunteer not found" 
            });
        }

        // Get assigned camps
        const assignedCamps = await Camp.find({
            volunteers: req.params.id
        }).select('name date start_time end_time location');

        res.json({
            success: true,
            volunteer: {
                ...volunteer.toObject(),
                assigned_camps: assignedCamps,
                total_camps: assignedCamps.length
            }
        });
        
    } catch (err) {
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
});

// 4. PUT /api/volunteers/:id - Update Volunteer (Admin/Technician)
router.put('/:id', protect, authorize('admin', 'technician'), async (req, res) => {
    try {
        const volunteer = await Volunteer.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                phone: req.body.phone,
                address: req.body.address,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode
            },
            { new: true, runValidators: true }
        );
        
        if (!volunteer) {
            return res.status(404).json({ 
                success: false,
                error: "Volunteer not found" 
            });
        }

        res.json({
            success: true,
            message: "Volunteer updated successfully",
            volunteer: volunteer
        });
        
    } catch (err) {
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
});

// 5. DELETE /api/volunteers/:id - Delete Volunteer (Admin Only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        // Check if volunteer is assigned to any camps
        const assignedCamps = await Camp.find({ volunteers: req.params.id });
        
        if (assignedCamps.length > 0) {
            return res.status(400).json({
                success: false,
                error: "Cannot delete volunteer assigned to camps. Remove from camps first."
            });
        }

        const volunteer = await Volunteer.findByIdAndDelete(req.params.id);
        
        if (!volunteer) {
            return res.status(404).json({ 
                success: false,
                error: "Volunteer not found" 
            });
        }

        res.json({
            success: true,
            message: "Volunteer deleted successfully"
        });
        
    } catch (err) {
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
});




export default router;