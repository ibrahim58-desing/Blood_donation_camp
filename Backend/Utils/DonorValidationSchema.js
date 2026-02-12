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
        isMobilePhone: {
            options: ["en-IN"],
            errorMessage: "Invalidde Indian mobile number"
        }
    },
    blood_type: {
        notEmpty: {
            errorMessage: "Blood type is required",
        },
        isIn: {
            options: [["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]],
            errorMessage: "Invalide blood type"
        }
    },
    gender: {
        notEmpty: {
            errorMessage: "Gender is required"
        },
        isIn: {
            options: [["male", "female", "others"]],
            errorMessage: "Gender must be male, female or others"
        }
    },
    date_of_birth: {
        notEmpty: {
            errorMessage: "Date of birth is required"
        },
        
    },
    address: {
        notEmpty: {
            errorMessage: "Address must not be empty"
        },
        isString: {
            errorMessage: "Enter only string"
        }
    },
   last_donation: {
        optional: true,  // Simply make it optional
        // custom: {
        //     options: (value) => {
        //         // If no value provided, it's valid
        //         if (!value) return true;
                
        //         // Check if it matches DD/MM/YYYY format
        //         const pattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        //         if (!pattern.test(value)) return false;
                
        //         const [day, month, year] = value.split('/');
        //         const date = new Date(`${year}-${month}-${day}`);
        //         return !isNaN(date.getTime());
        //     },
        //     errorMessage: "Invalid date format. Use DD/MM/YYYY"
        // }
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