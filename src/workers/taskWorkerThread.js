const { parentPort } = require('worker_threads');
const { PrismaClient } = require('@prisma/client');
const { getClientSocket } = require('../middlewares/webSocket');

const prisma = new PrismaClient();

const checkOverdueTasks = async () => {
    try {
        const now = new Date();

        const istOffset = 5.5 * 60 * 60 * 1000; 
        const nowIST = new Date(now.getTime() + istOffset);

        const overdueTasks = await prisma.task.findMany({
            where: {
                status: 'pending', 
                dueDate: { lte: nowIST },
            },
            include: {
                assignedToUser: true, 
            },
        });

        
        overdueTasks.forEach((task) => {
            const userId =  task.assignedToUser.id
            

            if (task.assignedToUser) {
                
                const notification = {
                    type: 'TASK_OVERDUE',
                    userId: task.assignedToUser.id,
                    taskId: task.id,
                    title: task.title,
                    dueDate: task.dueDate,
                    message: `The task "${task.title}" is overdue.`,
                };

                const userSocket = getClientSocket(userId);
                // console.log(userSocket);
                // if (userSocket) {
                //     parentPort.postMessage(notification);
                // }
                parentPort.postMessage(notification);   
            }
        });
    } catch (error) {
        console.error('Error checking overdue tasks:', error);
        parentPort.postMessage('Error checking overdue tasks.');
    }
};

setInterval(checkOverdueTasks, 10 * 1000); 
checkOverdueTasks()
