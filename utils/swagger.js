const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Basic options for Swagger documentation
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'A simple Node.js API',
            contact: {
                name: 'Your Name',
                email: 'your.email@example.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:8000/api', // Replace with your server URL
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to the API docs (use the correct relative path)
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerDocs, swaggerUi };
