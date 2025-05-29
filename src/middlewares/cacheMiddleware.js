const redisClient = require('../utils/redis');
const {sendResponse} = require("../utils/responseHandler"); 

const taskCache = (keyPrefix) => async (req, res, next) => {
    try {
        const key = `${keyPrefix}:${req.params.taskId}`;
        
        const cachedData = await redisClient.get(key);

        if (cachedData) {
            console.log('Cache hit');
            return sendResponse(res, {
                status: 200, 
                type: 'success',
                message: 'Data retrieved from cache',
                data: JSON.parse(cachedData),
            });
        }

        console.log('Cache miss');
        res.locals.cacheKey = key;
        next();
    } catch (error) {
        console.error('Redis Error:', error.message);
        sendResponse(res, {
            status: 500, 
            type: 'error',
            message: 'Error accessing cache.',
            error: error.message,
        });
    }
};

module.exports = taskCache;
