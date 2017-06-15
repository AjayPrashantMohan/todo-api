var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

//dialect tells which database

if (env === 'production') {//heroku
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		dialect: 'postgres'
	});
} else {
	sequelize = new Sequelize(undefined, undefined, undefined, {
		'dialect': 'sqlite',
		'storage': __dirname + '/data/dev-todo-api.sqlite'
	});
}
var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js');
db.user = sequelize.import(__dirname + '/models/user.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.todo.belongsTo(db.user);//belongsTo and hasMany are the sequelize function that establishes connection between the tables(todo and user) through a foreign key(id)
db.user.hasMany(db.todo);

module.exports = db;