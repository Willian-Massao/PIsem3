const Sequelize = require('sequelize');

const connection = new Sequelize({
    host: 'localhost',
    dialect: 'sqlite',
    storage: './database/data_base.db'
});

module.exports = connection;