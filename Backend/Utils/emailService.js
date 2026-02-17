import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

console.log('📧 Email Config Check:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Loaded' : '❌ Missing');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Loaded' : '❌ Missing');

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use 'gmail', 'yahoo', 'outlook', or custom SMTP
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS  // Your app password (not your regular password)
    }
});

// Verify connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email service configuration error:', error);
    } else {
        console.log('✅ Email service is ready to send emails');
    }
});

// Send email function
export const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"Blood Bank System" <${process.env.EMAIL_USER}>`, // Sender address
            to: to,                                                  // List of receivers
            subject: subject,                                        // Subject line
            html: html                                               // HTML body
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${to}`);
        console.log('📧 Message ID:', info.messageId);
        
        return {
            success: true,
            messageId: info.messageId,
            response: info.response
        };
        
    } catch (error) {
        console.error('❌ Error sending email:', error);
        
        return {
            success: false,
            error: error.message
        };
    }
};

// Send plain text email (alternative)
export const sendTextEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: `"Blood Bank System" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Text email sent to ${to}`);
        
        return {
            success: true,
            messageId: info.messageId
        };
        
    } catch (error) {
        console.error('❌ Error sending text email:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Send email with attachments (optional)
export const sendEmailWithAttachment = async (to, subject, html, attachments) => {
    try {
        const mailOptions = {
            from: `"Blood Bank System" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments // Array of attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email with attachment sent to ${to}`);
        
        return {
            success: true,
            messageId: info.messageId
        };
        
    } catch (error) {
        console.error('❌ Error sending email with attachment:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Test function to check email configuration
export const testEmailConfig = async () => {
    try {
        const testResult = await sendEmail(
            process.env.EMAIL_USER, // Send to yourself for testing
            'Test Email from Blood Bank System',
            '<h1>Email Service Test</h1><p>If you received this, your email configuration is working correctly!</p>'
        );
        
        if (testResult.success) {
            console.log('✅ Email test successful');
        } else {
            console.log('❌ Email test failed:', testResult.error);
        }
        
        return testResult;
        
    } catch (error) {
        console.error('❌ Email test error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};