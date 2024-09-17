const express = require('express');
//auth routes
const authRoute = require('./auth.route');
const userRoute = require('./user.route');

//Logger
const logger = require('../middleware/logger');
const router = express.Router();
router.use(logger);

const defaultRoutes = [
    {
        path: '/auth',
        route: authRoute,
    },
    {
        path: '/user',
        route: userRoute,
    },
];



defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;