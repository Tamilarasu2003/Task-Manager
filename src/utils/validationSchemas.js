const Joi = require('joi');

const signupSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.base': 'Name should be a type of string',
            'string.min': 'Name should have a minimum length of 3 characters',
            'string.max': 'Name should have a maximum length of 30 characters',
            'any.required': 'Name is required'
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.base': 'Email should be a type of string',
            'string.email': 'Enter the email in correct format',
            'any.required': 'Email is required'
        }),

    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.base': 'Password should be a type of string',
            'string.min': 'Password should have a minimum length of 6 characters',
            'any.required': 'Password is required'
        }),

    role: Joi.string()
        .valid('Manager', 'Developer', 'Tester', 'TeamLead')
        .default('Developer')
        .optional()
        .messages({
            'string.base': 'Role should be a type of string',
            'any.only': 'Role must be one of "Manager", "HR", "Developer", "Tester", or "TeamLead"'
        })
});

const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.base': 'Email should be a type of string',
            'string.email': 'Enter the email in correct format',
            'any.required': 'Email is required'
        }),

    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.base': 'Password should be a type of string',
            'string.min': 'Password should have a minimum length of 6 characters',
            'any.required': 'Password is required'
        })
});

const updateUserSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(30)
        .messages({
            'string.base': 'name must be a string',
            'string.min': 'name must be at least 3 characters long',
            'string.max': 'name must not exceed 30 characters',
    }),

    email: Joi.string()
        .email()
        .messages({
            'string.base': 'email must be a string',
            'string.email': 'Enter a valid email address',
    }),
    role: Joi.string()
        .valid('Manager', 'Developer', 'Tester', 'TeamLead')
        .default('Developer')
        .optional()
        .messages({
            'string.base': 'Role should be a type of string',
            'any.only': 'Role must be one of "Manager", "HR", "Developer", "Tester", or "TeamLead"'
        }),

    password: Joi.string()
        .min(6)
        .messages({
            'string.base': 'password must be a string',
            'string.min': 'password must be at least 6 characters long',
    }),
});

const createTaskSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.base': 'title must be a string',
            'string.min': 'title must be at least 3 characters long',
            'string.max': 'title must not exceed 100 characters',
            'any.required': 'title is required'
        }),

    description: Joi.string()
        .max(255)
        .optional()
        .allow(null)
        .messages({
            'string.base': 'description must be a string',
            'string.max': 'description must not exceed 255 characters',
        }),

    dueDate: Joi.date()
        .iso() 
        .required()
        .messages({
            'date.base': 'dueDate must be a valid date',
            'date.isoDate': 'dueDate must be a valid ISO 8601 date',
            'any.required': 'dueDate is required'
        }),

    createdBy: Joi.number()
        .integer()
        .required()
        .messages({
            'number.base': 'createdBy must be a number',
            'number.integer': 'createdBy must be an integer',
            'any.required': 'createdBy is required'
        }),

    assignedTo: Joi.number()
        .integer()
        .required()
        .messages({
            'number.base': 'assignedTo must be a number',
            'number.integer': 'assignedTo must be an integer',
            'any.required': 'assignedTo is required'
        }),
});

module.exports = {signupSchema, loginSchema, updateUserSchema, createTaskSchema};
