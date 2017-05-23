var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/',function(req,res){
	res.send('Hello Ajay');
});

app.get('/todos',function(req,res){
	res.json(todos);
});

app.get('/todos/:id',function(req,res){
	var requiredId = parseInt(req.params.id);
	var matchedRecord = _.findWhere(todos,{id:requiredId});
	if(matchedRecord){
		res.json(matchedRecord);
	}
	else{
		res.status(404).send();
	}
});

app.delete('/todos/:id',function(req,res){
	var requiredId = parseInt(req.params.id);
	var matchedRecord = _.findWhere(todos,{id:requiredId});
	if(matchedRecord){
		todos = _.without(todos,matchedRecord);
		res.json(matchedRecord);
	}
	else{
		res.status(404).json({
			"error":"no todo found with that id"
		});
	}
});

app.put('/todos/:id',function(req,res){
	var requiredId = parseInt(req.params.id);
	var matchedRecord = _.findWhere(todos,{id:requiredId});
	var body = _.pick(req.body,'description','completed');// use ._pick to only pick the required keys from request
	var validAttributes = {};

	if(!matchedRecord){
		return res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	}else if(body.hasOwnProperty('completed')){
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	}else if(body.hasOwnProperty('description')){
		return res.status(400).send();
	}
	_.extend(matchedRecord,validAttributes);
	res.json(matchedRecord);


});

app.post('/todos',function(req,res){
	var body = _.pick(req.body,'description','completed');// use ._pick to only pick the required keys from request
	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
		return res.status(400).send();// 400 is a status for not sending all the required inputs in the request
	}
	body.description = body.description.trim();
	body.id = todoNextId;
	todos.push(body);
	res.send("User with id "+body.id+" is successfully added");
	todoNextId++;
});


app.listen(PORT,function(){
	console.log("Express listening on the port" + PORT + ' !');
});