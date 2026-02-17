import cron from 'node-cron';
import { Volunteer } from '../Mongoose/Model/VolunteerSchema.js';
import { Camp } from '../Mongoose/Model/CampSchema.js';
import { sendEmail } from '../Utils/emailService.js';

console.log("🕐 Volunteer reminder cron loaded - Will send to ALL volunteers");

// Run every day at 9 AM
cron.schedule("0 9 * * *", async () => {
    try {
        console.log("🔍 Checking for camps in 2 days...");
        
        // Calculate date 2 days from now
        const today = new Date();
        const reminderDate = new Date();
        reminderDate.setDate(today.getDate() + 2);
        
        // Set to start and end of that day
        const startOfDay = new Date(reminderDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(reminderDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        // Find camps happening in 2 days
        const upcomingCamps = await Camp.find({
            date: { $gte: startOfDay, $lte: endOfDay },
            reminders_sent: false
        });
        
        console.log(`📅 Found ${upcomingCamps.length} camps in 2 days`);
        
        if (upcomingCamps.length === 0) {
            console.log("No camps scheduled for 2 days from now");
            return;
        }
        
        // Get ALL volunteers from database
        const allVolunteers = await Volunteer.find({});
        console.log(`👥 Found ${allVolunteers.length} total volunteers in database`);
        
        if (allVolunteers.length === 0) {
            console.log("No volunteers registered yet");
            return;
        }
        
        // For each camp, send emails to ALL volunteers
        for (const camp of upcomingCamps) {
            console.log(`📧 Sending reminders for camp: ${camp.name} to ALL ${allVolunteers.length} volunteers`);
            
            let successCount = 0;
            let failCount = 0;
            
            for (const volunteer of allVolunteers) {
                try {
                    // Create email content
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
                                        <p><strong>Date:</strong> ${new Date(camp.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                        <p><strong>Time:</strong> ${camp.start_time} - ${camp.end_time}</p>
                                        <p><strong>Location:</strong> ${camp.location}</p>
                                        <p><strong>Address:</strong> ${camp.address}</p>
                                        ${camp.description ? `<p><strong>Description:</strong> ${camp.description}</p>` : ''}
                                    </div>
                                    
                                    <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                        <p style="margin: 0;"><strong>⚠️ Please arrive 30 minutes early for briefing</strong></p>
                                        <p style="margin: 10px 0 0 0;">Kindly confirm your availability by replying to this email.</p>
                                    </div>
                                    
                                    <p>Your support saves lives! ❤️</p>
                                    <p>Best regards,<br>Blood Bank Team</p>
                                </div>
                                
                                <div class="footer">
                                    <p>© 2026 Blood Bank Management System</p>
                                    <p>This email was sent to all registered volunteers</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `;

                    await sendEmail(
                        volunteer.email,
                        `🔔 Volunteer Needed: Blood Donation Camp on ${new Date(camp.date).toLocaleDateString()}`,
                        emailHtml
                    );
                    
                    successCount++;
                    console.log(`  ✓ Sent to ${volunteer.name} (${volunteer.email})`);
                    
                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                } catch (emailErr) {
                    console.error(`  ✗ Failed to send to ${volunteer.email}:`, emailErr.message);
                    failCount++;
                }
            }
            
            // Mark reminders as sent for this camp
            camp.reminders_sent = true;
            await camp.save();
            
            console.log(`  ✅ Camp "${camp.name}" - Sent: ${successCount}, Failed: ${failCount}`);
        }
        
        console.log("✅ Volunteer reminder cron completed");
        
    } catch (error) {
        console.error("❌ Volunteer reminder cron error:", error);
    }
});