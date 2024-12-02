const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API Documentation',
        },
        servers: [
            {
                url: process.env.BASE_URL || 'http://localhost:3000/v1',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: [
        './docs/swagger/*.swagger.js',
        './routes/v1/*.route.js',
    ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec; 