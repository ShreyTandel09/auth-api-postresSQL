const Joi = require('joi');


// Function to validate user Login input
const validateLoginUser = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    })
}


// Function to validate user input
const validateUser = {
    body: Joi.object().keys({
        first_name: Joi.string().min(3).required(),
        last_name: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirm_password: Joi.string().valid(Joi.ref('password')).required().messages({
            'any.only': 'Passwords must match'
        })
    })
}

const validateEmail = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
    })
}

const validateResetPassword = {
    body: Joi.object().keys({
        password: Joi.string().min(6).required(),
        confirm_password: Joi.string().valid(Joi.ref('password')).required().messages({
            'any.only': 'Passwords must match'
        })
    })
}

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .required()
        .messages({
            'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character'
        })
});

module.exports = {
    validateLoginUser,
    validateUser,
    validateEmail,
    validateResetPassword,
    loginSchema
};