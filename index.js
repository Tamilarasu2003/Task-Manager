require('dotenv').config(); 

const express = require('express');
const {setupWebSocket} = require('./src/middlewares/webSocket');
const taskRoutes = require('./src/routes/taskRoute');
const userRoutes = require('./src/routes/userRoute');
const taskWorker = require('./src/utils/taskMonitor');

const app = express();

app.use(express.json());

app.get('/', (req,res) => {
    res.send("hello.....")
})

app.use('/task', taskRoutes);
app.use('/user', userRoutes);

const server = app.listen(5001, () => {
    console.log("app running successfully....");
    
})

setupWebSocket(server);

taskWorker();


