import mongoose from 'mongoose';

const CampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    start_time: {
        type: String,
        required: true
    },
    end_time: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    volunteers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer'
    }],
    reminders_sent: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Camp = mongoose.model('Camp', CampSchema);