export const requestValidationSchema = {
  requester_name: {
    notEmpty: { errorMessage: "Requester name is required" }
  },

  requester_contact: {
    notEmpty: { errorMessage: "Contact is required" },
    isMobilePhone: {
      options: ["en-IN"],
      errorMessage: "Invalid phone number"
    }
  },

  hospital_name: {
    notEmpty: { errorMessage: "Hospital name is required" }
  },

  patient_name: {
    optional: true,
    isString: true
  },

  blood_type: {
    isIn: {
      options: [["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]],
      errorMessage: "Invalid blood type"
    }
  },

  units_needed: {
    isInt: {
      options: { min: 1 },
      errorMessage: "Units must be at least 1"
    }
  },

  urgency: {
    optional: true,
    isIn: {
      options: [["normal", "urgent", "critical"]],
      errorMessage: "Invalid urgency"
    }
  },

  notes: {
    optional: true,
    isString: true
  }
};
