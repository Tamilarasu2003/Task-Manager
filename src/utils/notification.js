const { getClientSocket } = require('../middlewares/webSocket');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sendNotification = async (userId, data) => {
    // console.log(userId)
    const userSocket = getClientSocket(userId);
    if (userSocket && userSocket.readyState === 1) {
        userSocket.send(JSON.stringify(data))

        const updatedTask = await prisma.task.update({
            where: { id: parseInt(data.taskId, 10) },
            data: {
                status: "Incomplete",
                updatedAt: new Date(), 
            },
        });
    } 
    // else {
    //     console.log(`Unable to send notification. User ${userId} not connected.`);
    // }
};

module.exports = { sendNotification };
