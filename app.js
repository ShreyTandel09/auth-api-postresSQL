const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors'); // Import the cors module



const app = express();
app.use(cors()); // enable cors
app.options('*', cors()); // enable pre-flight

app.use(bodyParser.json());
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await sequelize.authenticate();
    console.log('Database connected!');
});
