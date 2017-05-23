var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
	"id":1,
	"description":"lunch",
	"completed":false
},
{
	"id":2,
	"description":"dinner",
	"completed":false
}];

app.get('/',function(req,res){
	res.send('Hello Ajay');
});

app.get('/todos',function(req,res){
	res.json(todos);
});

app.get('/todos/:id',function(req,res){
	var requiredId = parseInt(req.params.id);
	var matchedRecord;
	todos.forEach(function(todo){
		if(todo.id === requiredId){
			matchedRecord = todo;
		}
	});
	if(matchedRecord){
		res.json(matchedRecord);
	}
	else{
		res.status(404).send();
	}
});


app.listen(PORT,function(){
	console.log("Express listening on the port" + PORT + ' !');
});