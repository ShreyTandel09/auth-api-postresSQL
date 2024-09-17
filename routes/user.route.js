const express = require('express');
const validate = require('../middleware/validate');
const userController = require('../controllers/userController');

const isAuthenticated = require('../middleware/authMiddleware');


const router = express.Router();

router.get('/profile', isAuthenticated, userController.getUserProfile);
router.get('/all', isAuthenticated, userController.getAllUsers);


module.exports = router;
