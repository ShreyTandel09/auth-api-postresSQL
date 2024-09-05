'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here, if any
    }
  }

  User.init({
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true // Ensures that email is unique
    },
    password: DataTypes.STRING,
    confirm_password: DataTypes.STRING,
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user', // Default value for role
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Default value for isVerified
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};
