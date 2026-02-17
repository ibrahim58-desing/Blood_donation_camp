import { Volunteer } from '../Mongoose/Model/VolunteerSchema.js';
import { Camp } from '../Mongoose/Model/CampSchema.js';
import { sendEmail } from '../Utils/emailService.js';
import { welcomeVolunteerTemplate } from '../Utils/emailTemplates.js';

// Register new volunteer
export const registerVolunteer = async (req, res) => {
    try {
        const volunteer = new Volunteer(req.body);
        await volunteer.save();
        
        // Send welcome email
        await sendEmail(
            volunteer.email,
            'Welcome to Blood Bank Volunteer Team',
            welcomeVolunteerTemplate(volunteer)
        );
        
        res.status(201).json({ message: "Volunteer registered successfully", volunteer });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all volunteers
export const getAllVolunteers = async (req, res) => {
    try {
        const volunteers = await Volunteer.find();
        res.json(volunteers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get single volunteer
export const getVolunteerById = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);
        if (!volunteer) return res.status(404).json({ error: "Volunteer not found" });
        res.json(volunteer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update volunteer
export const updateVolunteer = async (req, res) => {
    try {
        const volunteer = await Volunteer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!volunteer) return res.status(404).json({ error: "Volunteer not found" });
        res.json(volunteer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete volunteer
export const deleteVolunteer = async (req, res) => {
    try {
        const volunteer = await Volunteer.findByIdAndDelete(req.params.id);
        if (!volunteer) return res.status(404).json({ error: "Volunteer not found" });
        res.json({ message: "Volunteer deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Assign volunteer to camp
export const assignToCamp = async (req, res) => {
    try {
        const { volunteerId, campId } = req.params;
        
        const volunteer = await Volunteer.findById(volunteerId);
        if (!volunteer) return res.status(404).json({ error: "Volunteer not found" });
        
        const camp = await Camp.findById(campId);
        if (!camp) return res.status(404).json({ error: "Camp not found" });
        
        // Add volunteer to camp
        if (!camp.volunteers.includes(volunteerId)) {
            camp.volunteers.push(volunteerId);
            await camp.save();
        }
        
        res.json({ message: "Volunteer assigned to camp successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Send manual reminder
export const sendManualReminder = async (req, res) => {
    try {
        const { campId } = req.params;
        const camp = await Camp.findById(campId).populate('volunteers');
        
        if (!camp) return res.status(404).json({ error: "Camp not found" });
        
        let sentCount = 0;
        
        for (const volunteer of camp.volunteers) {
            await sendEmail(
                volunteer.email,
                `Reminder: Blood Donation Camp on ${new Date(camp.date).toLocaleDateString()}`,
                volunteerReminderTemplate(volunteer, camp)
            );
            sentCount++;
        }
        
        res.json({ message: `Reminders sent to ${sentCount} volunteers` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};