const Sequelize = require("sequelize");
const connection = require('./database');

class UserModel extends Sequelize.Model {}
class AgentModel extends Sequelize.Model {}

UserModel.init({
    Name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Login: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Salt: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Address: {
        type: Sequelize.STRING,
        allowNull: false
    },
    CPF: {
        type: Sequelize.STRING,
        allowNull: false
    },
    BornDate: {
        type: Sequelize.DATE,
        allowNull: false
    },
    RG: {
        type: Sequelize.STRING,
        allowNull: false
    },
    CRM: {
        type: Sequelize.STRING,
        allowNull: true
    },
    Esp: {
        type: Sequelize.STRING,
        allowNull: true
    },
    Job: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, { sequelize: connection, modelName: 'Users'});

AgentModel.init({
    Secretary: {
        type: Sequelize.STRING,
        allowNull: true
    },
    medic: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Esp: {
        type: Sequelize.STRING,
        allowNull: false
    },
    patient: {
        type: Sequelize.STRING,
        allowNull: false
    },
    room: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    date:{
        type: Sequelize.DATE,
        allowNull: false,
        primaryKey: true
    }
}, { sequelize: connection, modelName: 'Agents'});

AgentModel.sync();

UserModel.sync();

module.exports = { UserModel, AgentModel };