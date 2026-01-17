export const createuservalidationschema = {
    name: {
        notEmpty: {
            errorMessage: "The name must not be  empty"
        },
        isLength: {
            option: { min: 3, max: 25 },
            errorMessage: "The lenght mut be between 3 and 25"
        },
        isString: {
            errorMessage: "Enter only letterrs"
        }
    },
    email: {
        notEmpty: {
            errorMessage: "The name must not be  empty"
        },
        isLength: {
            option: { min: 3, max: 25 },
            errorMessage: "The lenght mut be between 3 and 25"
        }
     },
    password: {
        notEmpty: {
            errorMessage: "Password must not be empty"
        }
    }

}