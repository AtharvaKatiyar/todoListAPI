import express from 'express';
import { authRouter } from './routes/authRouter.js';
import { todoRouter } from './routes/todoRouter.js';
import { verifyToken } from './controllers/authController.js';
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use((req, res, next)=>{
    console.log(req.url, req.method);
    next();
})
app.use('/api/auth', authRouter);
app.use('/api/todo',verifyToken, todoRouter);
app.get('/health', (req, res) =>{
    res.status(200).json({status:'ok'});
})

app.use((err, req, res, next)=>{
    console.error(err.message);
    res.status(500).json({
        error: err.message || "Internal server error"
    });
})
const port = 3000;
app.listen(port, ()=>{
    console.log(`Server started on: http://localhost:${port}`);
})