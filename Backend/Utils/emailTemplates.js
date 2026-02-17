export const volunteerReminderTemplate = (volunteer, camp) => {
    const campDate = new Date(camp.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 20px auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center; }
                .header h1 { color: white; margin: 0; }
                .content { padding: 30px; background: #f9fafb; }
                .camp-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
                .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🩸 Blood Donation Camp</h1>
                    <p style="color: #fee2e2;">Volunteer Reminder</p>
                </div>
                
                <div class="content">
                    <p>Dear <strong>${volunteer.name}</strong>,</p>
                    <p>This is a reminder that you're scheduled to volunteer at our upcoming blood donation camp in <strong>2 days</strong>.</p>
                    
                    <div class="camp-details">
                        <h3 style="margin-top: 0;">📋 Camp Details</h3>
                        <p><strong>Camp:</strong> ${camp.name}</p>
                        <p><strong>Date:</strong> ${campDate}</p>
                        <p><strong>Time:</strong> ${camp.start_time} - ${camp.end_time}</p>
                        <p><strong>Location:</strong> ${camp.location}</p>
                    </div>
                    
                    <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>⚠️ Please arrive 30 minutes early</strong></p>
                    </div>
                    
                    <p>Thank you for your valuable contribution! ❤️</p>
                </div>
                
                <div class="footer">
                    <p>© 2026 Blood Bank Management System</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

export const welcomeVolunteerTemplate = (volunteer) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; background: #f9fafb; border-radius: 10px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Welcome to Our Team! 🎉</h1>
            </div>
            <div style="padding: 30px;">
                <p>Dear <strong>${volunteer.name}</strong>,</p>
                <p>Thank you for registering as a volunteer with us!</p>
                <p>We'll notify you about upcoming camps where your help is needed.</p>
                <p>Best regards,<br>Blood Bank Team</p>
            </div>
        </div>
    `;
};