const { parentPort, workerData } = require('worker_threads');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAllTasks = async () => {
    try {
        const tasks = await prisma.task.findMany({
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

function sortById(tasks) {
    return tasks.sort((a, b) => a.id - b.id);
  }

(async () => {
    try {
        const tasks = await getAllTasks();
        
        const sortedTasks = sortById(tasks);
        parentPort.postMessage({ sortedTasks });
    } catch (error) {
        parentPort.postMessage({ error: error.message });
    }
})();
