const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const routes = require('./routes/v1/index');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { swaggerDocs } = require('./utils/swagger');

const app = express();

// Middleware
app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    explorer: true,
    customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-material.css'
}));

// Routes
app.use('/api', routes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger Documentation: http://localhost:${PORT}/api-docs`);
    await sequelize.authenticate();
    console.log('Database connected!');
});
