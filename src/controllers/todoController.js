import test from 'node:test';
import {prisma} from '../lib/prisma.js'

const getTodo = async (req, res, next) =>{
    try{
        const allTodos = await prisma.todo.findMany({
            where:{
                userId: req.user.userId,
            },
            select: {
                id: true,
                title: true,
                completed: true
            }
        })
        if(allTodos.length === 0){
            return res.status(200).json({
                message: 'Todo list is empty',
                todo: []
            })
        }
        return res.status(200).json({allTodos});
    } catch(error){
        console.error('Error while getting the todos: ',error);
        next(error);
    }
}

const deleteTodo = async (req, res, next) =>{
    try{
        const {id} = req.params;
        const userId = req.user.userId;
        const todo = await prisma.todo.findUnique({
            where: { id }
        })
        if(!todo){
            return res.status(404).json({error: 'Todo not found'});
        }
        if(todo.userId !== userId){
            return res.status(403).json({error: "Forbidden"});
        }
        const deletedTodo = await prisma.todo.delete({
            where: { id }
        })
        return res.status(200).json({message: 'Todo deleted successfully', deletedTodo});
    } catch(error){
        console.error('Error while deleting the todo: ',error);
        next(error);
    }
}

const updateTodo = async (req, res, next) => {
    try{
        const {id} = req.params;
        const {title, completed} = req.body;
        const userId = req.user.userId;
        const todo = await prisma.todo.findUnique({
            where: {id: id}
        })
        if(!todo){
            return res.status(404).json({error: 'Todo not found'});
        }
        if(todo.userId !== userId){
            return res.status(403).json({error: "Forbidden"});
        }
        const updatedData = {};
        if(title !== undefined){
            updatedData.title = title;
        }
        if(completed !== undefined) {
            updatedData.completed = completed;
        }
        if(Object.keys(updatedData).length === 0){
            return res.status(400).json({error: "Nothing to update. Provide title or completion status."})
        }
        const updatedTodo = await prisma.todo.update({
            where:{ id },
            data: updatedData,
            select: {
                id: true,
                title: true,
                completed: true
            }
        })
        return res.status(200).json({message: 'Updated Todo.', updatedTodo});
    } catch(error){
        console.error('Error while updating the todo: ',error);
        next(error);
    }
}

const postTodo = async (req, res, next) =>{
    try{
        const {title} = req.body;
        const todo = await prisma.todo.create({
            data: {
                title: title,
                userId: req.user.userId
            }
        })
        res.status(200).json({message: 'Todo posted successfully', id: todo.id});
    } catch(error){
        console.error('Error while posting the todo:',error);
        next(error);
    }
}

export {getTodo, deleteTodo, updateTodo, postTodo};