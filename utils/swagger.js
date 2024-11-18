require('dotenv').config(); // Load environment variables
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Retrieve the BASE_URL from the environment variables
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/v1';

// Basic options for Swagger documentation
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'A simple Node.js API',
            // Uncomment and update the contact details if required
            // contact: {
            //     name: 'Shrey Tandel',
            //     email: 'your.email@example.com',
            // },
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT', // Optional, specifies the format of the token
                },
            },
        },

        servers: [
            {
                url: `http://${BASE_URL}/api`, // Use the BASE_URL dynamically
                description: 'URL as per ENV',
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to the API docs (use the correct relative path)
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerDocs, swaggerUi };
