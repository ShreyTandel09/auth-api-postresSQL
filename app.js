const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const routes = require('./routes/index');
const cors = require('cors'); // Import the cors module



const app = express();
app.use(cors()); // enable cors
app.options('*', cors()); // enable pre-flight

app.use(bodyParser.json());
app.use('/api', routes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await sequelize.authenticate();
    console.log('Database connected!');
});
