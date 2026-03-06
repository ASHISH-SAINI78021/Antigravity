const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.empty': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email',
        'string.empty': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'string.empty': 'Password is required'
    })
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const jobSchema = Joi.object({
    companyName: Joi.string().required(),
    jobTitle: Joi.string().required(),
    jobLink: Joi.string().uri().allow(''),
    status: Joi.string().valid('Saved', 'Applied', 'Interview', 'Rejected', 'Offer'),
    resumeUsed: Joi.string().hex().length(24).allow(null),
    notes: Joi.string().allow(''),
    jobDescription: Joi.string().allow(''),
    followUpDate: Joi.date().allow(null, '')
});

const jobUpdateSchema = Joi.object({
    companyName: Joi.string(),
    jobTitle: Joi.string(),
    jobLink: Joi.string().uri().allow(''),
    status: Joi.string().valid('Saved', 'Applied', 'Interview', 'Rejected', 'Offer'),
    resumeUsed: Joi.string().hex().length(24).allow(null),
    notes: Joi.string().allow(''),
    jobDescription: Joi.string().allow(''),
    followUpDate: Joi.date().allow(null, '')
}).unknown(true);

module.exports = {
    registerSchema,
    loginSchema,
    jobSchema,
    jobUpdateSchema
};
