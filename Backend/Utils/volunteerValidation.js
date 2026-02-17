import { checkSchema } from 'express-validator';

export const volunteerValidationSchema = {
    name: {
        notEmpty: { errorMessage: "Name is required" },
        isLength: { options: { min: 2, max: 100 }, errorMessage: "Name must be between 2 and 100 characters" },
        trim: true
    },
    email: {
        notEmpty: { errorMessage: "Email is required" },
        isEmail: { errorMessage: "Please provide a valid email address" },
        normalizeEmail: true
    },
    phone: {
        notEmpty: { errorMessage: "Phone number is required" },
        matches: { options: [/^[0-9]{10}$/], errorMessage: "Phone number must be 10 digits" }
    },
    address: {
        notEmpty: { errorMessage: "Address is required" },
        trim: true
    },
    city: {
        notEmpty: { errorMessage: "City is required" },
        trim: true
    },
    state: {
        notEmpty: { errorMessage: "State is required" },
        trim: true
    },
    pincode: {
        notEmpty: { errorMessage: "Pincode is required" },
        matches: { options: [/^[0-9]{6}$/], errorMessage: "Pincode must be 6 digits" }
    }
};