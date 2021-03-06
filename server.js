var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json()); //body parser is used to recieve the json from body in request 

app.get('/', function(req, res) {
	res.send('Hello Ajay');
});

/*fetch an entry*/
//localhost:3000/todos
//localhost:3000/todos?completed=false
//localhost:3000/todos?completed=true
//localhost:3000/todos?q=watch
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var queryParams = req.query;
	var where = {
		userId: req.user.get('id')
	};

	if (queryParams.hasOwnProperty("completed") && queryParams.completed == "true") {
		where.completed = true;
	} else if (queryParams.hasOwnProperty("completed") && queryParams.completed == "false") {
		where.completed = false;
	}
	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		where.description = {
			$like: '%' + queryParams.q + '%'
		}
	}
	db.todo.findAll({
		where: where
	}).then(function(todos) {
		console.log('done');
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	});
});

/*fetch an entry with id*/
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var requiredId = parseInt(req.params.id);
	db.todo.findOne({
		where: {
			id: requiredId,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

/*delete an entry*/
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var requiredId = parseInt(req.params.id);
	db.todo.destroy({
		where: {
			id: requiredId,
			userId: req.user.get('id')
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				"error": "no todo found with that id"
			});
		} else {
			res.status(204).send();
		}
	}, function() {
		res.status(500).send();
	})
});

/*update an entry*/
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var requiredId = parseInt(req.params.id);
	var body = _.pick(req.body, 'description', 'completed'); // use ._pick to only pick the required keys from request
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}
	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}
	db.todo.findOne({
		where: {
			id: requiredId,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (todo) {
			return todo.update(attributes);
		} else {
			res.send(404).send();
		}
	}, function() {
		res.status(500).send();
	}).then(function(todo) { /*promise for when something in update goes wrong */
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e); //syntx error while update
	})
});

/*create an entry*/
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'description', 'completed'); // use ._pick to only pick the required keys from request
	db.todo.create(body).then(function(todo) {
		//user instance is set into req (ie)"req.user" through the requireAuthentication method in middleware.js
		//the following method addTodo is auto generated by sequelite to add todo into the user table instance
		req.user.addTodo(todo).then(function() {
			return todo.reload(); //reloads the todo reference in database
		}).then(function(todo) {
			res.json(todo.toJSON());
		});
	}, function(e) {
		res.status(400).json(e);
	})
});

/*create a user in user table*/
/*localhost:3000/users*/
app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}, function(e) {
		res.status(400).json(e);
	});
});

/*Authentictae a user*/
/*localhost:3000/users/login*/
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;
	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		userInstance = user;
		return db.token.create({
			token: token
		});
	}).then(function(tokenInstance) {
		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
	}).catch(function() {
		res.status(401).send();
	})
});


/*Delete user while logout*/
app.delete('/users/login', middleware.requireAuthentication, function(req, res) {
	req.token.destroy().then(function() {
		res.status(204).send();
	}).catch(function() {
		res.status(500).send();
	})
});


db.sequelize.sync({
	force: true
		/*drops and creates the table for every server startup*/
}).then(function() {
	app.listen(PORT, function() {
		console.log("Express listening on the port" + PORT + ' !');
	});
});