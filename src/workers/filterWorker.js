const { parentPort, workerData } = require('worker_threads');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const { userId, status } = workerData;

const getTasksByUserId = async (userId) => {
    try {

        const whereCondition = {};

        if (userId) {
            whereCondition.assignedTo = parseInt(userId, 10);
          }
          
          if (status) {
            whereCondition.status = status.toLowerCase();
          }

        const tasks = await prisma.task.findMany({
            where: whereCondition,
            include: {
                createdByUser: { select: { id: true, name: true, email: true } },
                assignedToUser: { select: { id: true, name: true, email: true } },
            },
        });

        return tasks;
    } catch (error) {
        throw new Error("Error retrieving tasks.");
    }
};

(async () => {
    try {
        console.log("getTasksByUserId worker RUNNING.....");
        
        const tasks = await getTasksByUserId(userId);
        parentPort.postMessage({ tasks });
    } catch (error) {
        parentPort.postMessage({ error: error.message });
    }
})();
