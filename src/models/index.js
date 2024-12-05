'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {   //filter: Filters out the files that should not be processed:
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {   //For each file:Initializes the model with the Sequelize instance and Sequelize.DataTypes.Adds the model to the db object, using the model's name as the key.
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });


Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) { //Checks if the model has an associate method.
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize; // Assign the Sequelize instance (database connection) to the db object. Responsible for interaction with the database.
db.Sequelize = Sequelize; // Assign the Sequelize library to the db object. It contains all classes and functions to define models and other Sequelize features.


module.exports = db;
