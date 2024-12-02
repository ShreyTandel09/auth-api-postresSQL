require('dotenv').config(); // Load environment variables
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const components = require('../docs/components.docs');
const authDocs = require('../docs/auth.docs');
const userDocs = require('../docs/user.docs');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API Documentation'
        },
        servers: [
            {
                url: `${process.env.BASE_URL}/api/v1`,
                description: 'API V1'
            }
        ],
        components,
        paths: {
            ...authDocs,
            ...userDocs
        }
    },
    apis: []
};

const specs = swaggerJsDoc(options);

module.exports = {
    serve: swaggerUi.serve,
    setup: swaggerUi.setup(specs)
};
