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
        confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
            'any.only': 'Confirm Password must match the Password'
        })
    })
}

module.exports = {
    validateLoginUser,
    validateUser,
};