const { Worker } = require('worker_threads');
const {sendNotification} = require('../utils/notification');
const redisClient = require('../utils/redis');

const {sendResponse} = require("../utils/responseHandler");

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.createTask = async (req, res) => {
    try {
        const { title, description, dueDate, createdBy, assignedTo } = req.body;

        if (!title || !createdBy || !assignedTo) {
            return sendResponse(res, {
                status: 400,
                type: 'Bad Request',
                message: 'Title, createdBy, and assignedTo are required.',
            });
        }

        const creator = await prisma.user.findUnique({
            where: { id: createdBy },
        });
        if (!creator) {
            return sendResponse(res, {
                status: 404,
                type: 'Not Found',
                message: 'Creator Not Found....',
            });
        }

        const assignee = await prisma.user.findUnique({
            where: { id: assignedTo },
        });
        if (!assignee) {
            return sendResponse(res, {
                status: 404,
                type: 'Not Found',
                message: 'Asignee Not Found....',
            });
        }

        const newTask = await prisma.task.create({
            data: {
                title,
                description,
                dueDate,
                createdBy,
                assignedTo,
            },
        });

        await prisma.task.upsert({
            where:{id:1},
            update:{
                name:"new name"
            },
            create:{
                name:"new name"
            }
        });

        await prisma.task.findMany({
            skip:10,
            size:15
        })


        prisma.task.$transaction({accessMiddleware, createTask})

        sendNotification(assignedTo, {
            type: 'TASK_ASSIGNED',
            newTask,
            message: `A new task has been assigned to you.`,
        });

        sendResponse(res, {
            status: 201,
            type: 'success',
            message: 'Task Created Successfully',
            data: newTask,
        });
    } catch (error) {
        console.error(error.message);
        sendResponse(res, {
            status: 500,
            type: 'Internal Server Error',
            message: 'Error creating task.....',
            error: error.message,
        });
    }
};

exports.allTasks = async (req, res) => {
    try {

        const worker = new Worker('./src/workers/sortWorker.js', { workerData: null });

        worker.on('message', (result) => {
            if (result.error) {
                return sendResponse(res, {
                    status: 500, 
                    type: 'error',
                    message: 'Internal Server Error',
                    error: result.error
                });
            }
            if (result.sortedTasks.length === 0) {
                return sendResponse(res, {
                    status: 404,
                    type: 'error',
                    message: 'No tasks found.',
                });
            }
            sendResponse(res, {
                status: 200,
                type: 'success',
                message: 'Tasks retrieved successfully',
                data: result.sortedTasks,
            });
        });

        worker.on('error', (error) => {
            console.error('Worker Error:', error);
            sendResponse(res, {
                status: 500,
                type: 'error',
                message: 'Error fetching tasks.',
                error: error.message,
            });
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }
        });
    } catch (error) {
        console.error(error.message);
        sendResponse(res, {
            status: 500,
            type: 'error',
            message: 'Error retrieving tasks.',
            error: error.message,
        });
    }
}

exports.submitTask = async (req, res) => {
    try {

        let { taskId } = req.params;
        taskId = parseInt(taskId, 10);

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                status: "completed",
                updatedAt: new Date(),
            },
        });

        await redisClient.del(`task:${taskId}`);
        console.log("cache deleted...");
        

        sendResponse(res, {
            status: 200, 
            type: 'success',
            message: 'Task submitted successfully.',
            data: updatedTask,
        });
    } catch (error) {
        console.error(error.message);
        sendResponse(res, {
            status: 500,
            type: 'error',
            message: 'Error submitting task.',
            error: error.message,
        });
    }
};

exports.getTaskByTaskId = async (req, res) => {
    try {
        const { taskId } = req.params;

        if (!taskId) {
            return sendResponse(res, {
                status: 400,
                type: 'error',
                message: 'Task ID is required.',
            });
        }

        // console.log('Cache miss');
        const task = await prisma.task.findUnique({
            where: { id: parseInt(taskId, 10) },
            include: {
                createdByUser: { select: { id: true, name: true, email: true } },
                assignedToUser: { select: { id: true, name: true, email: true } },
            },
        });

        if (!task) {
            return sendResponse(res, {
                status: 404,
                type: 'error',
                message: 'Task not found.',
            });
        }

        await redisClient.set(`task:${taskId}`, JSON.stringify(task), {
            EX: 3600,
        });

        return sendResponse(res, {
            status: 200,
            type: 'success',
            message: 'Task retrieved successfully.',
            data: task,
        });

    } catch (error) {
        console.error(error.message);
        return sendResponse(res, {
            status: 500, 
            type: 'error',
            message: 'Error retrieving task.',
            error: error.message,
        });
    }
};

exports.getTasksByUserId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return sendResponse(res, {
                status: 400,
                type: 'error',
                message: 'User ID is required.',
            });
        }

        const worker = new Worker('./src/workers/filterWorker.js', { workerData: { id } });

        worker.on('message', (result) => {
            if (result.error) {
                return sendResponse(res, {
                    status: 500,
                    type: 'error',
                    message: result.error,
                });
            }
            if (result.tasks.length === 0) {
                return sendResponse(res, {
                    status: 404,
                    type: 'error',
                    message: 'No tasks found for this user.',
                });
            }
            sendResponse(res, {
                status: 200,
                type: 'success',
                message: 'Tasks retrieved successfully.',
                data: result.tasks,
            });
        });

        worker.on('error', (error) => {
            console.error('Worker Error:', error);
            sendResponse(res, {
                status: 500,
                type: 'error',
                message: 'Error fetching tasks.',
                error: error.message,
            });
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }
        });

    } catch (error) {
        console.error(error.message);
        sendResponse(res, {
            status: 500,
            type: 'error',
            message: 'Error retrieving tasks.',
            error: error.message,
        });
    }
};

exports.getTasksByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        if (!status) {
            return sendResponse(res, {
                status: 400,
                type: 'error',
                message: 'Status is required.',
            });
        }

        const worker = new Worker('./src/workers/filterWorker.js', { workerData: { status } });

        worker.on('message', (result) => {
            if (result.error) {
                return sendResponse(res, {
                    status: 500,
                    type: 'error',
                    message: result.error,
                });
            }
            if (!result.tasks || result.tasks.length === 0) {
                return sendResponse(res, {
                    status: 404, // Not Found
                    type: 'error',
                    message: 'No tasks found.',
                });
            }
            sendResponse(res, {
                status: 200,
                type: 'success',
                message: 'Tasks retrieved successfully',
                data: result.tasks,
            });
        });

        worker.on('error', (error) => {
            console.error('Worker Error:', error);
            sendResponse(res, {
                status: 500,
                type: 'error',
                message: 'Error fetching tasks.',
                error: error.message,
            });
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }
        });

    } catch (error) {
        console.error(error.message);
        sendResponse(res, {
            status: 500,
            type: 'error',
            message: 'Error retrieving tasks.',
            error: error.message,
        });
    }
};

exports.editTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, description, status, assignedTo } = req.body;

        if (!taskId) {
            return sendResponse(res, {
                status: 400,
                type: 'error',
                message: 'Task ID is required.',
            });
        }

        const existingTask = await prisma.task.findUnique({
            where: { id: parseInt(taskId, 10) },
        });

        if (!existingTask) {
            return sendResponse(res, {
                status: 404,
                type: 'error',
                message: 'Task not found.',
            });
        }

        const updatedTask = await prisma.task.update({
            where: { id: parseInt(taskId, 10) },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(status && { status }),
                ...(assignedTo && { assignedTo }),
                updatedAt: new Date(), 
            },
        });

        sendNotification(updatedTask.assignedTo, {
            type: 'TASK_UPDATED',
            task: updatedTask,
            message: `Your task has been updated.`,
        });

        await redisClient.del(`task:${taskId}`);
        console.log("cache deleted...");

        sendResponse(res, {
            status: 200,    
            type: 'success',
            message: 'Task updated successfully.',
            data: updatedTask,
        });
    } catch (error) {
        console.error(error.message);
        sendResponse(res, {
            status: 500,
            type: 'error',
            message: 'Error updating task.',
            error: error.message,
        });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        if (!taskId) {
            return sendResponse(res, {
                status: 400,
                type: 'error',
                message: 'Task ID is required.',
            });
        }

        const existingTask = await prisma.task.findUnique({
            where: { id: parseInt(taskId, 10) },
        });

        if (!existingTask) {
            return sendResponse(res, {
                status: 404,
                type: 'error',
                message: 'Task not found.',
            });
        }

        await prisma.task.delete({
            where: { id: parseInt(taskId, 10) },
        });

        await redisClient.del(`task:${taskId}`);
        console.log("cache deleted...");

        sendResponse(res, {
            status: 200,
            type: 'success',
            message: 'Task deleted successfully.',
        });
    } catch (error) {
        console.error(error.message);
        sendResponse(res, {
            status: 500,
            type: 'error',
            message: 'Error deleting task.',
            error: error.message,
        });
    }
};
