const hash = require('../utils/hashPassword');
const jwtToken = require('../utils/jwtauth');
const redisClient = require('../utils/redis');
const { PrismaClient } = require('@prisma/client');
const {sendResponse} = require('../utils/responseHandler');

const prisma = new PrismaClient();

exports.createUser = async (req, res) => {
    try{
        const {name, email, password, role} = req.body;

        const existingUser = await prisma.user.findUnique({
            where: {
              email: email,
            }
          });

        if(existingUser){
            return sendResponse(res, {
                status: 400,
                type: 'error',
                message: `User with email ${email} already exists.`,
                data: existingUser,
            });
        }

        const hashedPassword = await hash.hashPassword(password);

        const newUser = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                role: role,
            },
        })

        const { password: _, ...userWithoutPassword } = newUser;

        sendResponse(res, {
            status: 201, 
            type: 'success',
            message: 'User created successfully.',
            data: userWithoutPassword,
        });

    }catch(error){
        console.error(error.message);
        sendResponse(res, {
            status: 500,
            type: 'error',
            message: 'Error creating user.',
            error: error.message,
        });
    }
}

exports.login = async (req, res) => {
    try{
        const {email, password} = req.body;

        const existingUser = await prisma.user.findUnique({
            where: {
              email: email,
            }
        });

        if(!existingUser){
            return sendResponse(res, {
                status: 404, 
                type: 'error',
                message: 'User not found.',
            });
        }

        const hashCompare = await hash.hashCompare(password, existingUser.password)

        if(!hashCompare){
            return sendResponse(res, {
                status: 401,
                type: 'error',
                message: 'Password authentication failed.',
            });
        }

        let token = await jwtToken.createToken({
            id:existingUser.id,
            name:existingUser.name,
            email:existingUser.email,
            role:existingUser.role,
        });

        await redisClient.set(`user:${existingUser.id}:token`, token, {
            EX: 3600,
        });

        const { password: _, ...userWithoutPassword } = existingUser;
        

        sendResponse(res, {
            status: 200,
            type: 'success',
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                token: token,
            },
        });

    }catch(error){
        console.error(error.message);
        sendResponse(res, {
            status: 500,
            type: 'error',
            message: 'Login error, please try again later.',
            error: error.message,
        });

    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const allUsers = await prisma.user.findMany({
            include: {
                tasksAssigned: true,
            },
        });

        if (allUsers.length === 0) {
            return sendResponse(res, {
                status: 404,
                type: 'error',
                message: 'No users found.',
            });
        }

        const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);

        sendResponse(res, {
            status: 200,
            type: 'success',
            message: 'Users retrieved successfully.',
            data: usersWithoutPasswords,
        });

    } catch (error) {
        console.error(error.message);
        sendResponse(res, {
            status: 500,
            type: 'error',
            message: 'Error retrieving users.',
            error: error.message,
        });
    }
};

exports.getUserByUserId = async (req, res) => {

    try{
        const {id} = req.params;
        const userId = parseInt(id, 10);
    
        const userByUserId = await prisma.user.findUnique({
            where: {
              id: userId,
            }
          });
    
        if(!userByUserId){
            return sendResponse(res, {
                status: 404,
                type: 'error',
                message: `User with ID: ${userId} not found.`,
            });
        }

        const { password: _, ...userWithoutPassword } = userByUserId;
    
        sendResponse(res, {
            status: 200,
            type: 'success',
            message: 'User retrieved successfully.',
            data: userWithoutPassword,
        });

    }catch(error){
        console.error(error.message);
        sendResponse(res, {
            status: 500,
            type: 'error',
            message: 'Error retrieving user.',
            error: error.message,
        });
    }
}

exports.updateUserByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, password } = req.body;

        const userId = parseInt(id, 10);

        if (isNaN(userId)) {
            return sendResponse(res, {
                status: 400,
                type: 'error',
                message: 'Invalid userId provided. userId should be a number.',
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            return sendResponse(res, {
                status: 404, 
                type: 'error',
                message: `User with ID: ${userId} not found.`,
            });
        }

        let hashedPassword = password;
        if(password){
            hashedPassword = await hash.hashPassword(password);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name || user.name, 
                email: email || user.email,
                role: role || user.role,
                password: hashedPassword || user.password,
            },
        });

        const { password: _, ...userWithoutPassword } = updatedUser;


        return sendResponse(res, {
            status: 200, 
            type: 'success',
            message: 'User updated successfully.',
            data: userWithoutPassword,
        });

    } catch (error) {
        console.error(error.message);
        return sendResponse(res, {
            status: 500, 
            type: 'error',
            message: 'Error updating user.',
            error: error.message,
        });
    }
};

exports.deleteUserByUserId = async (req, res) => {
    try {
        const { id } = req.params;

        const userId = parseInt(id, 10);

        if (isNaN(userId)) {
            return sendResponse(res, {
                status: 400,
                type: 'error',
                message: 'Invalid userId provided. userId should be a number.',
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return sendResponse(res, {
                status: 404, 
                type: 'error',
                message: `User with ID: ${userId} not found.`,
            });
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        sendResponse(res, {
            status: 200,
            type: 'success',
            message: `User with ID: ${userId} successfully deleted.`,
        });

    } catch (error) {
        console.error(error.message);
        sendResponse(res, {
            status: 500,
            type: 'error',
            message: 'Error deleting user.',
            error: error.message,
        });
    }
};

