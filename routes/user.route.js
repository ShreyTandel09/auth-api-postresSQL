const express = require('express');
const validate = require('../middleware/validate');
const userController = require('../controllers/userController');
const upload = require('../middleware/fileUpload');

const isAuthenticated = require('../middleware/authMiddleware');


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management endpoints
 */

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 first_name:
 *                   type: string
 *                   example: John
 *                 last_name:
 *                   type: string
 *                   example: Doe
 *                 email:
 *                   type: string
 *                   example: johndoe@example.com
 *                 user_image:
 *                   type: string
 *                   example: /uploads/profile.jpg
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', isAuthenticated, userController.getUserProfile);

/**
 * @swagger
 * /user/all:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       first_name:
 *                         type: string
 *                         example: John
 *                       last_name:
 *                         type: string
 *                         example: Doe
 *                       email:
 *                         type: string
 *                         example: johndoe@example.com
 *       500:
 *         description: Internal server error
 *       401:
 *         description: Unauthorized
 */
router.get('/all', isAuthenticated, userController.getAllUsers);

/**
 * @swagger
 * /user/update-profile:
 *   put:
 *     summary: Update the current user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 first_name:
 *                   type: string
 *                   example: John
 *                 last_name:
 *                   type: string
 *                   example: Doe
 *                 email:
 *                   type: string
 *                   example: johndoe@example.com
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/update-profile', isAuthenticated, userController.updateUserProfile);

/**
 * @swagger
 * /user/upload-profile-picture:
 *   post:
 *     summary: Upload a new profile picture
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 user_image:
 *                   type: string
 *                   example: /uploads/profile.jpg
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
    '/upload-profile-picture',
    isAuthenticated,
    upload.single('profileImage'),
    userController.updateUserProfilePicture
);



module.exports = router;
