require('dotenv').config()
const express = require('express');
const cors = require('cors');
const joi = require('joi');
const logRequest = require('./middlewares/logger.js');
const validateTodos = require('./middlewares/validator.js');
const validatePatch = require('./middlewares/validatorPatch.js');
const errorhandler = require('./middlewares/errorHandler.js');
const connectDB = require('./database/db.js');
const Todo = require('./models/todos.model.js');
const app = express();

app.use(express.json()); // Parse JSON bodies

app.use(cors());

connectDB();

app.use(logRequest);


// Query '/todos?completed=true or ?completed=false'
app.get('/todos', async (req, res, next) => {
  try {
    const { completed } = req.query;

    let filter = {};

    // If user send /todos?completed=true or false, we filter
    if (completed !== undefined) {
      if (completed === 'true') {
        filter.completed = true;
      } else if (completed === 'false') {
        filter.completed = false;
      } else {
        return res.status(400).json({ 
          message: "completed must be 'true' or 'false'" 
        });
      }
    }

    const todos = await Todo.find(filter).sort({ createdAt: -1 });
    res.json(todos);

  } catch (err) {
    next(err);
  }
});


// GET All – Read todos
app.get('/todos', async (req, res) => {
  const todos = await Todo.find({});
  res.status(200).json(todos); // Send array as JSON
});

// GET active todos
app.get('/todos/active', (req, res, next) => {
  try {
    const activeTodos = todos.filter(t => !t.completed);
  res.json(activeTodos);
  } catch (error) {
    next(error);
  }
});

//GET single read
app.get('/todos/:id', async (req, res, next) => {
  try {
  const todo = await Todo.findById(req.params.id);

  // Gives response if condition is met
  if(!todo){
    return res.status(404).json({message: "request not found"});
  }
  res.json(todo);
  } catch (error) {
    next(error);
  }
});

// POST New – Create
app.post('/todos', validateTodos, async (req, res, next) => {
  const{task, completed} = req.body;
  const newTodo = new Todo({
    task,
    completed,
  })

  await newTodo.save();
try {
  res.status(201).json(newTodo); // Echo back
} catch (error) {
  next(error);
}
});

// PATCH Update – Partial
app.patch('/todos/:id', validatePatch, async (req, res, next) => {
  try {
const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
  new: true
})
if(!todo){
    return res.status(404).json({message: "request not found"});
  }
    
  res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
});

// DELETE Remove
app.delete('/todos/:id', async (req, res, next) => {
  try {

    const todo = await Todo.findByIdAndDelete(req.params.id);

    if(!todo){
    return res.status(404).json({message: "request not found"});
  };
    res.status(200).json({message: `Todo ${req.params.id} deleted`});
  } catch (error) {
    next(error);
  }
});


app.use(errorhandler);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server on port ${port}`));
