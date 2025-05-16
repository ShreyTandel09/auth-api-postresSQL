require('dotenv').config(); // Load environment variables
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Basic options for Swagger documentation
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Authentication API Documentation',
            version: '1.0.0',
            description: 'API Documentation for Authentication System',
            contact: {
                name: 'Your Name',
                email: 'your.email@example.com',
            },
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:8005/api/v1',
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
        './src/docs/swagger/*.swagger.js'
    ],
};

try {
    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    module.exports = { swaggerUi, swaggerDocs };
} catch (error) {
    console.error('Error setting up Swagger:', error);
    throw error;
}
