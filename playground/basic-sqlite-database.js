var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	/*dialect tells which database*/
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		/*does not allow null*/
		validate: {
			len: [1, 250] /*does not allow string less than length one and 250 is the max number of character*/
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
})

var User = sequelize.define('user', {
	email: {
		type: Sequelize.STRING
	}
});

Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync({
//	force: true //force property will drop the table each time and create a new one ,'false' is the default property
}).then(function() {
	console.log("Everything is synced");

	User.findById(1).then(function(user) {
		user.getTodos({
			where:{
				completed:false
			}
		}).then(function(todos) {
			todos.forEach(function(todo) {
				console.log(todo.toJSON());
			})
		})
	})

	User.create({
		email: 'ajay.mohan@intellectdesign.com',
	}).then(function() {
		return Todo.create({
			description: 'clean Yard'
		})
	}).then(function(todo) {
		User.findById(1).then(function(user) {
			user.addTodo(todo);
		})
	})


	/*Todo.create({
		description: 'Take out trash'
	}).then(function(todo) {
		return Todo.create({
			description: 'Do the dishes'
		});
	}).then(function() {
		//return Todo.findById(1);
		return Todo.findAll({
			where: {
				//completed: false
				description: {
					$like: '%trash%'
				}
			}
		})
	}).then(function(todos) {
		if (todos) {
			todos.forEach(function(todo) {
				console.log(todo.toJSON());
			})
		} else {
			console.log("no todos found");
		}
	}).then(function(todo) {
		console.log('Finished');
		console.log(todo);
	}).catch(function(e) {
		console.log(e);
	});*/
});