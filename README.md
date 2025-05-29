# Task Management Application - Backend

This is the backend service for the Task Management Application, designed to handle task assignment, updates, and real-time notifications using WebSockets.

## Features

- **Task Management**: Create, update, delete, and retrieve tasks.
- **User Management**: Manage user profiles and authentication.
- **Real-Time Notifications**: Notify users via WebSockets when tasks are assigned or updated.
- **Database Integration**: Efficient data storage and retrieval using Prisma with a PostgreSQL database.
- **Worker Threads**: Optimize heavy data operations using worker threads.

## Technologies Used

- **Node.js**: JavaScript runtime for building the backend service.
- **Express.js**: Lightweight framework for creating APIs.
- **Prisma**: ORM for database management.
- **WebSockets**: Real-time communication with clients.
- **Redis**: Pub/Sub for notifications and caching.
- **Worker Threads**: For handling data-intensive tasks.
- **Nodemon**: For hot-reloading during development.

## Prerequisites

- Node.js (v20.17.0 or later)
- PostgreSQL (configured and running)
- Redis (configured and running)

## Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd Backend_Project
   ```

2. Install dependencies:

    ```npm install```

3. Create a .env file and configure it with the following variables:

    ```
    DATABASE_URL=<your_postgresql_connection_string>
    JWT_TOKEN=<your_JWT_Token>
    PORT=5000
    SALT_ROUNDS=12
    JWT_EXPIRE='1h'
    ```

4. Run database migrations:

    ```npx prisma migrate dev```

5. Start the server:

    ```npm start```


# API Endpoints

## User Endpoints

- **`POST /user/signup`**: Create a new user.
- **`POST /user/login`**: Login for existing User.
- **`GET /user/allusers`**: Retrive all users data.
- **`GET /user/getuserbyuserid/:id`**: Retrive the user data by user id.
- **`PUT /user/updateuserbyuserid/:id`**: Update the user data by user id.
- **`DELETE /user/deleteuserbyuserid/:id`**: Delete the user data by user id.

## Task Endpoints

- **`POST /task/createtask`**: Create a new task.
- **`GET /task/getalltasks`**: Get all tasks.
- **`PUT /task/submittask/:taskId`**: Submit the completed task by ID.
- **`GET /task/gettaskbyid/:taskId`**: Retrive the task by task id.
- **`GET /task/gettaskbyuserid/:userId`**: Retrive the task by User id.
- **`GET /task/gettaskbystatus/:status`**: Retrive the task by Status.
- **`PUT /task/edittask/:taskId`**: Edit the assigned task.
- **`DELETE /task/deletetask/:taskId`**: Delete the assigned task.

## WebSocket Endpoints

- **Connection**: Clients connect to WebSocket to receive task notifications.
- **Messages**: Receive notifications when tasks are assigned or updated.
# Task-Manager
