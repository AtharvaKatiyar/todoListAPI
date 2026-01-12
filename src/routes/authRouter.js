import express from 'express';
import { regiController, loginController } from '../controllers/authController.js';

const authRouter = express.Router();
authRouter.post('/register',await regiController);
authRouter.post('/login', await loginController);
export {authRouter};