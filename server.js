var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Hello Ajay');
});

//localhost:3000/todos/
app.get('/todos', function(req, res) {
	res.json(todos);
});

//localhost:3000/todos/query?completed=true&q=one
app.get('/todos/query', function(req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;
	if (queryParams.hasOwnProperty("completed") && queryParams.completed == "true") {
		filteredTodos = _.where(filteredTodos, {
			completed: true
		}); // _.where finds the all instances with the given id
	} else if (queryParams.hasOwnProperty("completed") && queryParams.completed == "false") {
		filteredTodos = _.where(filteredTodos, {
			completed: false
		}); // _.where finds the all instances with the given id
	}


	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) { // _.filter will filter the results based on the condition in the callback(its 2nd parameter)
			return todo.description.toLowerCase().indexOf(queryParams.q) > -1;
		});
	}
	res.json(filteredTodos);
});

app.get('/todos/:id', function(req, res) {
	var requiredId = parseInt(req.params.id);

	db.todo.findById(requiredId).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
	/*var matchedRecord = _.findWhere(todos, {
		id: requiredId
	});
	if (matchedRecord) {
		res.json(matchedRecord);
	} else {
		res.status(404).send();
	}*/
});

app.delete('/todos/:id', function(req, res) {
	var requiredId = parseInt(req.params.id);
	var matchedRecord = _.findWhere(todos, {
		id: requiredId
	}); // _.findWhere finds the first instance with the given id
	if (matchedRecord) {
		todos = _.without(todos, matchedRecord);
		res.json(matchedRecord);
	} else {
		res.status(404).json({
			"error": "no todo found with that id"
		});
	}
});

app.put('/todos/:id', function(req, res) {
	var requiredId = parseInt(req.params.id);
	var matchedRecord = _.findWhere(todos, {
		id: requiredId
	});
	var body = _.pick(req.body, 'description', 'completed'); // use ._pick to only pick the required keys from request
	var validAttributes = {};

	if (!matchedRecord) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}
	_.extend(matchedRecord, validAttributes);
	res.json(matchedRecord);


});

app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed'); // use ._pick to only pick the required keys from request

	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e);
	})

	/*if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send(); // 400 is a status for not sending all the required inputs in the request
	}
	body.description = body.description.trim();
	body.id = todoNextId;
	todos.push(body);
	res.send("User with id " + body.id + " is successfully added");
	todoNextId++;*/
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log("Express listening on the port" + PORT + ' !');
	});
});