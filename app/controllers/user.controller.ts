import { NextFunction, Request, Response } from 'express';
import { User } from '../models/index.model';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import passport from 'passport';
import { hashPassword,  } from '../services/hash.service';
import bcrypt from 'bcrypt';

dotenv.config(); // Charger les variables d'environnement

// Afficher les informations de l'utilisateur pour afficher sa page profil
export const getUser = async (req: Request & {user?:any}, res: Response): Promise<void> => {
    try {
        //verifier si le user.id existe
        if (!req.user || !req.user._id) {
            res.status(404).send({ error: 'Utilisateur non trouvé' });
            return;
        }
        //recuperer l'utilisateur sauf son password et son _id
        const user = await User.findById(req.user._id).select('-password -_id');
        if (!user) {
            res.status(404).send({ error: 'Utilisateur non trouvé' });
            return;
        }
        res.status(200).send(user);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
        res.status(500).send({ error: 'Erreur lors de la récupération de l\'utilisateur' });
    }
}

export const updateUser = async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
      // Vérifier si le user.id existe
      if (!req.user || !req.user._id) {
        res.status(404).send({ error: 'Utilisateur non trouvé', label: 'user'});
        return;
      }
  
      // Récupérer l'utilisateur
      const user = await User.findById(req.user._id);
      if (!user) {
        res.status(404).send({ error: 'Utilisateur non trouvé', label: 'user'});
        return;
      }
  
      // Récupérer les champs à modifier
      const { username, lastname, email, password, old_password } = req.body;      
  
      // Vérifier si les champs sont vides
      if (!username && !lastname && !email && !password) {
        res.status(400).send({ error: 'Au moins un champ est requis', label: 'user'});
        return;
      }
  
      // Vérifier si l'email est unique
      if (email) {
        const existingUser = await User.findOne({ email }, '_id');
        // Si l'email existe et n'est pas le sien
        if (existingUser && String(existingUser._id) !== String(req.user._id)) {
          res.status(400).send({ error: 'Cet email est déjà utilisé', label: 'email'});
          return;
        }
      }

  
      // Vérifier si le mot de passe est correct
      if (password) {
        if (!old_password) {
          res.status(400).send({ error: 'L\'ancien mot de passe est requis', label: 'old_password'});
          return;
        }
  
        // Utiliser bcrypt pour comparer le password avec old_password
        const isOldPasswordValid = await bcrypt.compare(old_password, user.password);
        if (!isOldPasswordValid) {            
            res.status(400).send({ error: 'L\'ancien mot de passe est incorrect', label: 'old_password'});
            return;
        }
  
        // Vérifier si le nouveau mot de passe est le même que l'ancien
        const isSamePassword = await bcrypt.compare(password, user.password);
        
        if (isSamePassword) {
          res.status(400).send({ error: 'Le nouveau mot de passe doit être différent de l\'ancien', label: 'password'});
          return;
        }
  
        // Vérifier si le mot de passe est valide
        user.password = await hashPassword(password);
      }
  
      // Modifier les champs
      if (username) user.username = username;
      if (lastname) user.lastname = lastname;
      if (email) user.email = email;
      
      // Sauvegarder l'utilisateur
      await user.save();
      res.status(200).send(user);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
      res.status(500).send({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
}

export const signup = async (req: Request, res: Response): Promise<void> => {
    const { username, lastname, email, password, passwordConfirmation } = req.body;

    if (!username || !lastname || !email || !password || !passwordConfirmation) {
        res.status(400).send({ message: 'Tous les champs sont requis' });
        return;
    }

    if (password !== passwordConfirmation) {
        res.status(400).send({ message: 'Les mots de passe ne correspondent pas' });
        return;
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).send({ message: 'Cet email est déjà utilisé' });
            return;
        }

        const hashedPassword = await hashPassword(password);

        const newUser = new User({
            username,
            lastname,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();
        res.status(201).send(savedUser);
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
        res.status(500).send({ message: 'Erreur lors de la création de l\'utilisateur' });
    }
};

// export const createUser = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { username, lastname, email, password } = req.body;
        
//         if (!username || !lastname || !email || !password) {
//             res.status(400).send({ error: 'Tous les champs sont requis' });
//             return;
//         }

//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             res.status(400).send({ error: 'Cet email est déjà utilisé' });
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
        
//         res.status(201).send(savedUser);
//     } catch (error) {
//         console.error('Erreur lors de la création de l\'utilisateur :', error);
//         res.status(500).send({ error: 'Erreur lors de la création de l\'utilisateur' });
//     }
// };

// export const loginUser = (req: Request, res: Response, next: NextFunction) => {
//     passport.authenticate('local', { session: false }, (err: Error, user: { _id: string; }, info: { message: any; }) => {
//         if (err) {
//             return res.status(500).send({ error: 'Erreur lors de l\'authentification' });
//         }
//         if (!user) {
//             return res.status(400).send({ error: info && info.message ? info.message : 'Échec de l\'authentification' });
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
//             return res.status(500).send({ error: 'Erreur lors de l\'authentification' });
//         }
//         if (!user) {
//             return res.status(400).send({ error: info && info.message ? info.message : 'Échec de l\'authentification' });
//         }
//         const accessToken = jwt.sign({ user: user._id }, String(process.env.NODE_ENV), { expiresIn: '1h' });
//         res
//         .header('Authorization', accessToken)
//         .send(user);
//     })(req, res, next);
// }
