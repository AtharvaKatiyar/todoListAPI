import express from 'express';
import { getTodo, postTodo, updateTodo, deleteTodo } from '../controllers/todoController.js';
const todoRouter = express.Router();

todoRouter.get('/', getTodo);
todoRouter.post('/add', postTodo);
todoRouter.put('/update/:id', updateTodo);
todoRouter.delete('/delete/:id', deleteTodo);
export {todoRouter};