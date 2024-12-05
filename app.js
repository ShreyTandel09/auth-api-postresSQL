const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./src/models');
const routes = require('./src/routes/v1');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { swaggerDocs } = require('./src/utils/swagger');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');
const requestLogger = require('./src/middleware/requestLogger');

const app = express();

// Middleware
app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Add request logger before other middleware
app.use(requestLogger);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    explorer: true,
    customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-material.css'
}));

// Routes
app.use('/api/v1', routes);

// Error handler (must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Database connected successfully');

        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
            logger.info(`Swagger Documentation: http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        logger.error('Server startup failed', { error });
        process.exit(1);
    }
};

startServer();
