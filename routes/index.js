const express = require('express');
//auth routes
const authRoute = require('./auth.route');
//Logger
const logger = require('../middleware/logger');
const router = express.Router();
router.use(logger);

const defaultRoutes = [
    {
        path: '/auth',
        route: authRoute,
    },
];



defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;