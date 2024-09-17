const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = [];

    for (let i = 0; i < 10; i++) {
      const firstName = faker.person.firstName(); // Generate first name
      const password = 'User@123'; // Generate random password

      users.push({
        email: firstName.toLowerCase() + '@yopmail.com', // Email starts with first name and ends with @yopmail.com
        password: await bcrypt.hash(password, 10), // Hashing the password
        confirm_password: await bcrypt.hash(password, 10), // Same hash for confirmation
        first_name: firstName,
        last_name: faker.person.lastName(),
        isVerified: faker.datatype.boolean(),
        role: faker.helpers.arrayElement(['user', 'admin']),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return queryInterface.bulkInsert('Users', users, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
