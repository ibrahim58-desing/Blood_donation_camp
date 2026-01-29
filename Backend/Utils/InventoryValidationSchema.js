
export const inventoryValidationSchema = {
    
    donor_code: {
        matches: {
            options: [/^DON-[a-zA-Z0-9]+$/],
            errorMessage: "Invalid donor code"
        }
    },

    components: {
        isIn: {
            options: [['whole_blood', 'rbc', 'plasma', 'platelets']],
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
        optional: true,
        isISO8601: {
            errorMessage: "Invalid expiry date"
        }
    },
    storage_location: {
        notEmpty: {
            errorMessage: "Storage location is require"
        }
    },
    status: {
        optional: true,
        isIn: {
            options: [['available', 'reserved', 'used', 'expired', 'discard']],
            errorMessage: "Invalid status"
        }
    }

}