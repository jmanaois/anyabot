const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const asmt_queue = sequelize.define('asmt_queue', {
	asmtname: {
			type: Sequelize.STRING,
			primaryKey: true,
	},
	user: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	startHr: {
			type: Sequelize.INTEGER,
			allowNull: false,
	},
	startMin: {
			type: Sequelize.INTEGER,
			allowNull: false,
	},
	completed: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,	
	},
}, {
	timestamps: false
});


module.exports = asmt_queue;