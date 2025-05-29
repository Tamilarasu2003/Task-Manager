const express = require('express');
const taskController = require('../controllers/taskController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const accessMiddleware = require('../middlewares/accessMiddleware');
const taskCache = require('../middlewares/cacheMiddleware');
const router = express.Router();

router.post('/createtask',authMiddleware.adminGuard, validationMiddleware.validateTask, taskController.createTask);

router.get('/getalltasks',authMiddleware.adminGuard,taskController.allTasks )

router.put('/submittask/:taskId',authMiddleware.userGuard, accessMiddleware.validateUpdateAccess, taskController.submitTask);

router.get('/gettaskbyid/:taskId',authMiddleware.userGuard, accessMiddleware.validateReadAccess, taskCache('task'), taskController.getTaskByTaskId);

router.get('/gettaskbyuserid/:id',authMiddleware.validateUser,accessMiddleware.validateReadAccess, taskController.getTasksByUserId);

router.get('/gettaskbystatus/:status',authMiddleware.adminGuard, taskController.getTasksByStatus);

router.put('/edittask/:taskId',authMiddleware.adminGuard, taskController.editTask);

router.delete('/deletetask/:taskId',authMiddleware.adminGuard, taskController.deleteTask);


module.exports = router;