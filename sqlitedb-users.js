const Sequelize = require('sequelize');

const sequelize = new Sequelize('user_database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const users = sequelize.define('users', {
	user_id: {
		type: Sequelize.STRING,
		allowNull: false,
		primaryKey: true,
	},
	timezone: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
}, {
	timestamps: false
});


module.exports = users;