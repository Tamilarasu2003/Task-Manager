const { WebSocketServer } = require('ws');

const clients = new Map();

exports.setupWebSocket = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        ws.on('message', (message) => {
            try {
                const { userId } = JSON.parse(message);
                if (userId) {
                    clients.set(userId, ws);
                    console.log(`User ${userId} connected.`);
                    ws.send(JSON.stringify({ type: 'CONNECTED', message: 'WebSocket connection established.' }));
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        });

        ws.on('close', () => {
            for (const [userId, clientWs] of clients.entries()) {
                if (clientWs === ws) {
                    clients.delete(userId);
                    console.log(`User ${userId} disconnected.`);
                    break;
                }
            }
        });
    });

    console.log('WebSocket server initialized.');
};

exports.getClientSocket = (userId) => {
    return clients.get(userId);
};




