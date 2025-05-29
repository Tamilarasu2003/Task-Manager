const { Worker } = require('worker_threads');
const { sendNotification } = require('../utils/notification');

const taskWorker = () => {

    const worker = new Worker('./src/workers/taskWorkerThread' );
    worker.on('message', (message) => {
        if (message.error) {
            console.error('Error from Worker:', message.error);
        } else {
            // console.log('Received notification data:', message);

            sendNotification(message.userId, {
                type: 'TASK_OVERDUE',
                taskId: message.taskId,
                title: message.title,
                dueDate: message.dueDate,
                message: message.message,
            });
        }
    });

    worker.on('error', (error) => {
        console.error('Worker Error:', error);
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
    })

};

module.exports = taskWorker;