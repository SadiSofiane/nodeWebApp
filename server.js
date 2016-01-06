var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3005;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

// GET /todos?completed=false&q=work
app.get('/todos', function (req, res) {
	var query = req.query;

    var where = {};

    
	var filteredTodos = todos;

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q.toLowerCase() + '%'
        }
	}

    db.todo.findAll({where: where}).then(function (todos) {
        res.json(todos);   
    }, function (e) {
        res.status(400).json(e);    
    });
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}
});

// POST /todos
app.post('/todos', function (req, res) {
	var body = _.pick(req.body, 'description', 'completed');
    db.todo.create(body).then(function (todo) {
        return res.json(todo);
    }, function (e) {
        return res.status(400).json(e);
    });
});

// DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if (!matchedTodo) {
		res.status(404).json({"error": "no todo found with that id"});
	} else {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}
});

// PUT /todos/:id
app.put('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);

    db.todo.findById(todoId).then(function (matchedTodo) {
        if (matchedTodo) {
            return res.json(matchedTodo);
        } else {
            return res.status(404).send();
        }
    });
});

db.sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log('Express listening on port ' + PORT + '!');
    });
});

