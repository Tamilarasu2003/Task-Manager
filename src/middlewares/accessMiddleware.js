const { sendResponse } = require('../utils/responseHandler');

const checkAccessPermission = async (req, res, next, permission) => {

    try {
        const user = req.user;      

        if (!user.access[permission]) {
            return sendResponse(res, {
                status: 403,
                type: 'error',
                message: `You do not have ${permission} permission.`,
            });
        }
        next();

    } catch (error) {
        console.error("Access Error:", error);
        return sendResponse(res, {
            status: 401,
            type: 'error',
            message: 'Error occurred while checking the access.',
            error: error.message,
        });
    }
};

const validateCreateAccess = (req, res, next) => {
    return checkAccessPermission(req, res, next, 'create');
};

const validateReadAccess = (req, res, next) => {
    return checkAccessPermission(req, res, next, 'read');
};

const validateUpdateAccess = (req, res, next) => {
    return checkAccessPermission(req, res, next, 'update');
};

const validateDeleteAccess = (req, res, next) => {
    return checkAccessPermission(req, res, next, 'delete');
};


module.exports = {
    validateCreateAccess,
    validateReadAccess,
    validateUpdateAccess,
    validateDeleteAccess
};
