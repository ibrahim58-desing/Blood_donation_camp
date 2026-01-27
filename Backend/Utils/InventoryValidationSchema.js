
export const inventoryValidationSchema = {
    unit_number: {
        notEmpty: {
            errorMessage: "Unit number is required"
        }
    },

    donor_id: {
        isMongoId: {
            errorMessage: "Invalid donor Id"
        }
    },
    blood_type: {
        isIn: {
            options: [['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']],
            errorMessage: "Invalid blood type"
        }
    },
    component: {
        isIn: {
            option: [['whole_blood', 'rbc', 'plasma', 'platelets']],
            errorMessage: "Invalide component type"
        }

    },
    volume_ml: {
        errorMessage: "Volume must be a postive number"
    },
    collection_date: {
        isISO8601: {
            errorMessage: "Invalide expiry date"
        },
        toDate: true
    },
    expiry_date: {
        isISO8601: {
            errorMessage: "Invalid expiry date"
        }
    },
    storage_location:{
        notEmpty:{
            errorMessage:"Storage location is require"
        }
    },
    status:{
        option:true,
        isIn:{
            option:[['available','reserved','used','expired','discard']],
            errorMessage:"Invalid status"
        }
    }

}