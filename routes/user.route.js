const express = require('express');
const validate = require('../middleware/validate');
const userController = require('../controllers/userController');
const upload = require('../middleware/fileUpload');

const isAuthenticated = require('../middleware/authMiddleware');


const router = express.Router();

router.get('/profile', isAuthenticated, userController.getUserProfile);
router.get('/all', isAuthenticated, userController.getAllUsers);

router.put('/update-profile', isAuthenticated, userController.updateUserProfile);

router.post('/upload-profile-picture', isAuthenticated, upload.single('profile_picture'), userController.updateUserProfilePicture);


module.exports = router;
