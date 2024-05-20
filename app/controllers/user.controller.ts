// import { NextFunction, Request, Response } from 'express';
// import { User } from '../models/index.model';
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// import passport from 'passport';
// import { hashPassword,  } from '../services/hash.service';

// dotenv.config(); // Charger les variables d'environnement

// export const createUser = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { username, lastname, email, password } = req.body;
        
//         if (!username || !lastname || !email || !password) {
//             res.status(400).json({ error: 'Tous les champs sont requis' });
//             return;
//         }

//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             res.status(400).json({ error: 'Cet email est déjà utilisé' });
//             return;
//         }

//         const hashedPassword = await hashPassword(password);
        
//         const newUser = new User({
//             username,
//             lastname,
//             email,
//             password: hashedPassword,
//         });

//         const savedUser = await newUser.save();
        
//         res.status(201).json(savedUser);
//     } catch (error) {
//         console.error('Erreur lors de la création de l\'utilisateur :', error);
//         res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
//     }
// };

// export const loginUser = (req: Request, res: Response, next: NextFunction) => {
//     passport.authenticate('local', { session: false }, (err: Error, user: { _id: string; }, info: { message: any; }) => {
//         if (err) {
//             return res.status(500).json({ error: 'Erreur lors de l\'authentification' });
//         }
//         if (!user) {
//             return res.status(400).json({ error: info && info.message ? info.message : 'Échec de l\'authentification' });
//         }
//         const token = jwt.sign({ sub: user._id }, String(process.env.JWT_SECRET), { expiresIn: '1h' });
//         const refreshToken = jwt.sign({ sub: user._id }, String(process.env.REFRESH_TOKEN_SECRET), { expiresIn: '1d' });
        
//         res
//         .cookie('refreshToken', refreshToken, { 
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict',
//         })
//         .header('Authorization', token).send({ user, token });
//     })(req, res, next);
// };

// export const refreshToken = (req: Request, res: Response, next: NextFunction) => {
//     passport.authenticate('refresh-token', { session: false }, (err: Error, user: { _id: string; }, info: { message: any; }) => {
//         if (err) {
//             return res.status(500).json({ error: 'Erreur lors de l\'authentification' });
//         }
//         if (!user) {
//             return res.status(400).json({ error: info && info.message ? info.message : 'Échec de l\'authentification' });
//         }
//         const accessToken = jwt.sign({ user: user._id }, String(process.env.NODE_ENV), { expiresIn: '1h' });
//         res
//         .header('Authorization', accessToken)
//         .send(user);
//     })(req, res, next);
// }
