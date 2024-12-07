const bcrypt = require('bcryptjs');

const password = 'Password123!';
const hashedPassword = bcrypt.hashSync(password, 8);

const userOne = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@yopmail.com',
    password: hashedPassword,
    isVerified: true
};

const userTwo = {
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@yopmail.com',
    password: hashedPassword,
    isVerified: false
};

module.exports = {
    userOne,
    userTwo,
    password
}; 