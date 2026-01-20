export const donorvalidationschema = {
    name: {
        notEmpty: {
            errorMessage: "The name must not be  empty"
        },
        isString: {
            errorMessage: "Enter only letterrs"
        }
    },
    email: {
        notEmpty: {
            errorMessage: "The name must not be  empty"
        },
        isEmail: {

            errorMessage: "invalide emaail formate"
        }
    },
    phone_no: {
        notEmpty: {
            errorMessage: "phone  must not be empty"
        },
        isMobile: {
            option: ["en-IN"],
            errorMessage: "Invalidde Indian mobile number"
        }
    },
    blood_type: {
        notEmpty: {
            errorMessage: "Blood type is required",
        },
        isIn: {
            option: [["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]],
            errorMessage: "Invalide blood type"
        }
    },
    gender: {
        required: true,
        isIn: {
            options: [["male", "female", "others"]],
            errorMessage: "Gender must be male, female or others"
        }
    },
    date_of_birth: {
        required: true,
        isDate: {
            errorMessage: "invlide date of birth"
        }
    },
    address: {
        isEmpty: {
            errorMessage: "Address must not be empty"
        },
        isString: {
            errorMessage: "Enter only string"
        }
    },
    last_donation: {
        optional: { nullable: true },
        isDate: {
            errorMessage: "Invalid last donation date"
        }
    },

    total_donations: {
        optional: { nullable: true },
        isInt: {
            options: { min: 0 },
            errorMessage: "Total donations must be a positive number"
        }
    },


    is_eligible: {
        optional: true,
        isBoolean: {
            errorMessage: "Eligibility must be true or false"
        },
    }
}