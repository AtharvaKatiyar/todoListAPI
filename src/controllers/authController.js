import bcrypt from 'bcrypt';
import {prisma} from '../lib/prisma.js'
import jwt from 'jsonwebtoken'

const saltRounds = Number(process.env.SALT_ROUND);

const regiController = async (req, res, next) => {
    try {
        if(!req.body.email || !req.body.password){
            return res.status(400).json({error: 'Email and password required'});
        }
        const email = req.body.email;
        const passwordHash = await bcrypt.hash(req.body.password, saltRounds);
        try{
            const existing = await prisma.user.findUnique({
                where : {
                    email: email
                }
            })
            if(existing){
                return  res.status(409).json({error: 'User with this email already exists, Login Instead'});
            }
            const user = await prisma.user.create({
                data: {
                    email: email,
                    passwordHash: passwordHash
                }
            })

            return res.status(201).json({message: 'User Registered Successfully', userId: user.id});
        } catch(error){
            if(!res.headersSent){
                res.status(500).json({error: error.message})
            }
        }   
    }catch(error){
        next(error);
    }
}

const loginController = async(req, res, next) => {
    const {email, password} = req.body;
    try{
        if(!email || !password){
            return res.status(400).json({error: 'Email and password required for login'});
        }
        const existing = await prisma.user.findUnique({where:
            {   email: req.body.email   }
        })
        if(!existing) return res.status(400).json({error: 'User does not exist. Register to log in'});
        const isMatch = await bcrypt.compare(password.trim(), existing.passwordHash);
        if(!isMatch){
            return res.status(401).json({error: 'Invalid Password'})
        }
        const token = jwt.sign(
            { userId: existing.id,
              email: existing.email},
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const {passwordHash: _, ...userWithoutPassword} = existing;
        return res.status(200).json({
            message: 'Login successful. Use the token to access the api.',
            token,
            user: userWithoutPassword
        })

    } catch(error){
        console.error(error);
        if(!res.headersSent){
            return res.status(500).json({error: 'Internal server error'});
        }
    }
}

const verifyToken = (req, res, next) => {
    const authHeader =req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({error: 'Access denied. No token provided'})
    }
    const token = authHeader && authHeader.split(' ')[1];
    try{
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch(error){
        return res.status(403).json({error: 'Invalid or expired token'})
    }
}

export {regiController, loginController, verifyToken};