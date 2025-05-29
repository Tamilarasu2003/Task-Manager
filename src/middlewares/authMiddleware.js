const  jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const redisClient = require('../utils/redis');
const {sendResponse} = require('../utils/responseHandler');

const validateUser = async (req, res, next) => {

    try {
        
        let token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return sendResponse(res, {
                status: 401,
                type: 'error',
                message: 'No token found......',
            });
        }

        const { id } = req.params;
        let payload = await jwt.verify(token, process.env.JWT_TOKEN);

        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime >= payload.exp) {
            return sendResponse(res, {
                status: 401,
                type: 'error',
                message: 'Token has expired.',
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            include: {
                access: true, 
            },
        });

        if (!user) {
            return sendResponse(res, {
                status: 404,
                type: 'error',
                message: 'User not found.',
            });
        }    

        req.user = user; 
        
        if(user.access['isAdmin']){
            return next();
        } 
         
        const requestedUserId = parseInt(id, 10);
        
        if (isNaN(requestedUserId) || requestedUserId !== payload.id) {
            return sendResponse(res, {
                status: 403,
                type: 'error',
                message: 'ID mismatch with token.',
            });
        }

        const redisToken = await redisClient.get(`user:${payload.id}:token`);
        if (!redisToken || redisToken !== token) {
            console.log("JWT Cache Mismatch...");
            return sendResponse(res, {
                status: 401,
                type: 'error',
                message: 'Token is invalid or expired.',
            });
        }
        console.log("JWT Cache HIT");

        return next();

    } catch (error) {
        console.error("Auth Error:", error);
        return sendResponse(res, {
            status: 401,
            type: 'error',
            message: 'Invalid token.',
            error: error.message,
        });
    }
};

// const validateManager = async (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//         return sendResponse(res, {
//             status: 401,
//             type: 'error',
//             message: 'No token found......',
//         });
//     }

//     try {
//         const payload = await jwt.verify(token, process.env.JWT_TOKEN);

//         const user = await prisma.user.findUnique({
//             where: { id: payload.id },
//             include: {
//                 access: true,
//             },
//         });

//         if (!user) {
//             return sendResponse(res, {
//                 status: 404,
//                 type: 'error',
//                 message: 'User not found.',
//             });
//         }

//         if (user.role !== 'Manager') {
//             return sendResponse(res, {
//                 status: 403,
//                 type: 'error',
//                 message: 'Only Managers are authorized to perform this action.',
//             });
//         }

//         const redisToken = await redisClient.get(`user:${payload.id}:token`);

//         if (!redisToken || redisToken !== token) {
//             console.log("JWT Cache Mismatch with REDIS...");
//             return sendResponse(res, {
//                 status: 401,
//                 type: 'error',
//                 message: 'Token is invalid or expired.',
//             });
//         }

//         console.log("JWT Cache HIT");

//         const currentTime = Math.floor(Date.now() / 1000);
//         if (currentTime >= payload.exp) {
//             return sendResponse(res, {
//                 status: 401,
//                 type: 'error',
//                 message: 'Token has expired.',
//             });
//         }

//         return next();
//     } catch (error) {
//         console.error("JWT Error:", error.message);
//         return sendResponse(res, {
//             status: 401,
//             type: 'error',
//             message: 'Invalid token.',
//             error: error.message,
//         });
//     }
// };

const userGuard = async (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return sendResponse(res, {
            status: 401,
            type: 'error',
            message: 'No token found in the request.',
        });
    }

    try {
        let { taskId } = req.params;

        if (!taskId) {
            return sendResponse(res, {
                status: 400,
                type: 'error',
                message: 'Task ID is required.',
            });
        }

        let payload = await jwt.verify(token, process.env.JWT_TOKEN);

        taskId = parseInt(taskId, 10);

        if (isNaN(taskId)) {
            return sendResponse(res, {
                status: 400,
                type: 'error',
                message: 'Invalid task ID format.',
            });
        }

        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task) {
            return sendResponse(res, {
                status: 404,
                type: 'error',
                message: 'Task not found.',
            });
        }

        const redisToken = await redisClient.get(`user:${payload.id}:token`);

        if (!redisToken || redisToken !== token) {
            console.log("User Cache Mismatch....");
            return sendResponse(res, {
                status: 401,
                type: 'error',
                message: 'Token is invalid or has expired.',
            });
        }

        console.log("User Cache HIT");

        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            include: {
                access: true, 
            },
        });

        if (!user) {
            return sendResponse(res, {
                status: 404,
                type: 'error',
                message: 'User not found.',
            });
        }

        req.user = user;
        
        if (user.access['isAdmin']) {
            return next();
        }

        if(task.assignedTo !== user.id){
            return sendResponse(res, {
                status: 403,
                type: 'error',
                message: 'You are not authorized to access this task.',
            });
        }

        next();
    } catch (error) {
        console.error("JWT Error:", error.message);
        return sendResponse(res, {
            status: 401,
            type: 'error',
            message: 'Invalid token.',
            error: error.message,
        });
    }
};

const adminGuard = async (req, res, next) => {
console.log("admin guard start...");


    try {
        let token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return sendResponse(res, {
                status: 401,
                type: 'error',
                message: 'No token found. Authorization required.',
            });
        }

        let payload = await jwt.verify(token, process.env.JWT_TOKEN);

        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime >= payload.exp) {
            return sendResponse(res, {
                status: 401,
                type: 'error',
                message: 'Token has expired.',
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            include: {
                access: true,
            },
        });

        if (!user) {
            return sendResponse(res, {
                status: 404,
                type: 'error',
                message: 'User not found.',
            });
        }

        if (user.access.isAdmin) {
            const redisToken = await redisClient.get(`user:${payload.id}:token`);

            if (!redisToken || redisToken !== token) {
                console.log("User Cache Mismatch....");

                return sendResponse(res, {
                    status: 401,
                    type: 'error',
                    message: 'Token is invalid or expired.',
                });
            }

            console.log("User Cache HIT");


        
            next();
        } else {
            return sendResponse(res, {
                status: 403,
                type: 'error',
                message: 'Admin access required......',
            });
        }
    } catch (error) {
        console.error("JWT Error:", error.message);
        return sendResponse(res, {
            status: 401,
            type: 'error',
            message: 'Invalid or expired token.',
            error: error.message,
        });
    }
};




module.exports = {validateUser, adminGuard, userGuard}
