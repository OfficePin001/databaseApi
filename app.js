require('dotenv').config()
const express = require('express');
const cors = require('cors');
const joi = require('joi');
const logRequest = require('./middlewares/logger.js');
const validateTodos = require('./middlewares/validator.js');
const validatePatch = require('./middlewares/validatorPatch.js');
const errorhandler = require('./middlewares/errorHandler.js');
const app = express();
app.use(express.json()); // Parse JSON bodies

app.use(cors());

app.use(logRequest);
let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: false },
];

// GET All – Read
app.get('/todos', (req, res) => {
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
app.get('/todos/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
   if (isNaN(id)) {
     throw new Error('Invalid ID');
     
   }
  const todo = todos.find(t => t.id===id);

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
app.post('/todos', validateTodos,(req, res, next) => {
try {
  // Now this can create a new todo
  const newTodo = { id: todos.length + 1, ...req.body }; // Auto-ID
  todos.push(newTodo);
  res.status(201).json(newTodo); // Echo back
} catch (error) {
  next(error);
}
});

// PATCH Update – Partial
app.patch('/todos/:id', validatePatch, (req, res, next) => {
  try {
    const todo = todos.find((t) => t.id === parseInt(req.params.id)); // Array.find()
  if (!todo) return res.status(404).json({ message: 'Todo not found' });
  Object.assign(todo, req.body); // Merge: e.g., {completed: true}
  res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
});

// DELETE Remove
app.delete('/todos/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
  const initialLength = todos.length;
  todos = todos.filter((t) => t.id !== id); // Array.filter() – non-destructive
  if (todos.length === initialLength)
    return res.status(404).json({ error: 'Not found' });
  res.status(204).send(); // Silent success
  } catch (error) {
    next(error);
  }
});

app.get('/todos/completed', (req, res, next) => {
  try {
    const completed = todos.filter((t) => t.completed);
  res.json(completed); // Custom Read!
  } catch (error) {
    next(error);
  }
});

app.use(errorhandler);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server on port ${port}`));