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

/*fetch an entry*/
//localhost:3000/todos
//localhost:3000/todos?completed=false
//localhost:3000/todos?completed=true
//localhost:3000/todos?q=watch
app.get('/todos', function(req, res) {
	var queryParams = req.query;
	var where = {};

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
});

/*delete an entry*/
app.delete('/todos/:id', function(req, res) {
	var requiredId = parseInt(req.params.id);
	db.todo.destroy({
		where: {
			id: requiredId
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

/*create an entry*/
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed'); // use ._pick to only pick the required keys from request
	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e);
	})
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log("Express listening on the port" + PORT + ' !');
	});
});