const { signupSchema ,loginSchema, updateUserSchema, createTaskSchema} = require('../utils/validationSchemas'); // Path to your Joi schema
const {sendResponse} = require("../utils/responseHandler"); 

const validateSignup = (req, res, next) => {

    const { error } = signupSchema.validate(req.body);
    if (error) {
        return sendResponse(res, {
            status: 400, 
            type: 'error',
            message: 'Invalid signup data',
            error: error.details[0].message,
        });
    }
    next();
};

const validateLogin = (req, res, next) => {

    const { error } = loginSchema.validate(req.body);
    if (error) {
        return sendResponse(res, {
            status: 400,
            type: 'error',
            message: 'Invalid login data',
            error: error.details[0].message,
        });
    }
    next();
};

const validateUpdate = (req, res, next) => {

    const { error } = updateUserSchema.validate(req.body);
    
    if (error) {
        return sendResponse(res, {
            status: 400, 
            type: 'error',
            message: 'Invalid update data',
            error: error.details[0].message,
        });
    }
    next();
};

const validateTask = (req, res, next) => {

    const { error } = createTaskSchema.validate(req.body);
    if (error) {
        return sendResponse(res, {
            status: 400,
            type: 'error',
            message: 'Invalid task creation data',
            error: error.details[0].message,
        });
    }
    next();
};

module.exports = {validateSignup, validateLogin, validateUpdate, validateTask};
