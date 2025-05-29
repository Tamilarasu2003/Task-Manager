const express = require('express');
const userController = require('../controllers/userController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const accessMiddleware = require('../middlewares/accessMiddleware');
const router = express.Router();

router.post('/createUser/', authMiddleware.adminGuard, validationMiddleware.validateSignup, userController.createUser);

router.post('/login', validationMiddleware.validateLogin, userController.login);

router.get('/allusers/',authMiddleware.adminGuard, userController.getAllUsers);

router.get('/getuserbyuserid/:id',authMiddleware.validateUser, accessMiddleware.validateReadAccess, userController.getUserByUserId);

router.put('/updateuserbyuserid/:id', authMiddleware.validateUser, accessMiddleware.validateUpdateAccess, validationMiddleware.validateUpdate, userController.updateUserByUserId);

router.delete('/deleteuserbyuserid/:id', authMiddleware.validateUser,accessMiddleware.validateDeleteAccess, userController.deleteUserByUserId);

module.exports = router;