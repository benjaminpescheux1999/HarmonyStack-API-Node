import { NextFunction, Request, Response } from 'express';
import { User } from '../models/index.model';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import passport from 'passport';
import { hashPassword,  } from '../services/hash.service';
import bcrypt from 'bcrypt';

dotenv.config();

// Display user information to show their profile page
export const getUser = async (req: Request & {user?:any, t?:any}, res: Response): Promise<void> => {
    const t = req.t;
    try {
        //check if user.id exists
        if (!req.user || !req.user._id) {
            res.status(404).send({ error: t('user_not_found') });
            return;
        }
        //retrieve the user except their password and _id
        const user = await User.findById(req.user._id).select('-password -_id');
        if (!user) {
            res.status(404).send({ error: t('user_not_found') });
            return;
        }
        res.status(200).send(user);
    } catch (error) {
        console.error(t('error_retrieving_user'), error);
        res.status(500).send({ error: t('error_retrieving_user') });
    }
}

export const updateUser = async (req: Request & { user?: any, t?:any }, res: Response): Promise<void> => {
  const t = req.t;
    try {
      // Check if user.id exists
      if (!req.user || !req.user._id) {
        res.status(404).send({ error: t('user_not_found'), label: 'user'});
        return;
      }
  
      // Retrieve the user
      const user = await User.findById(req.user._id);
      if (!user) {
        res.status(404).send({ error: t('user_not_found'), label: 'user'});
        return;
      }
  
      // Retrieve fields to modify
      const { username, lastname, email, password, old_password } = req.body;      
  
      // Check if fields are empty
      if (!username && !lastname && !email && !password) {
        res.status(400).send({ error: t('at_least_one_field_required'), label: 'user'});
        return;
      }
  
      // Check if email is unique
      if (email) {
        const existingUser = await User.findOne({ email }, '_id');
        // If email exists and is not theirs
        if (existingUser && String(existingUser._id) !== String(req.user._id)) {
          res.status(400).send({ error: t('email_already_used'), label: 'email'});
          return;
        }
      }

      // Check if the password is correct
      
      if (password || password!=='' || (password && password.length < 8) ) {
        if (!old_password || old_password === '') {
          res.status(400).send({ error: t('old_password_required'), label: 'old_password'});
          return;
        }
  
        // Use bcrypt to compare password with old_password
        const isOldPasswordValid = await bcrypt.compare(old_password, user.password);
        if (!isOldPasswordValid) {            
            res.status(400).send({ error: t('incorrect_old_password'), label: 'old_password'});
            return;
        }
  
        // Check if the new password is the same as the old one
        const isSamePassword = await bcrypt.compare(password, user.password);
        
        if (isSamePassword) {
          res.status(400).send({ error: t('new_password_must_be_different'), label: 'password'});
          return;
        }
  
        // Check if the password is valid
        user.password = await hashPassword(password);
      }
  
      // Modify fields
      if (username) user.username = username;
      if (lastname) user.lastname = lastname;
      if (email) user.email = email;
      
      // Save the user
      await user.save();
      res.status(200).send({message: t('user_updated_successfully')});
    } catch (error) {
      console.error(t('error_updating_user'), error);
      res.status(500).send({ error: t('error_updating_user') });
    }
}

export const signup = async (req: Request & { t?:any }, res: Response): Promise<void> => {
    const t = req.t;
    const { username, lastname, email, password, passwordConfirmation } = req.body;

    if (!username || !lastname || !email || !password || !passwordConfirmation) {
        res.status(400).send({ message: t('all_fields_required') });
        return;
    }

    if (password !== passwordConfirmation) {
        res.status(400).send({ message: t('passwords_do_not_match') });
        return;
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).send({ message: t('email_already_used') });
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
        console.error(t('error_creating_user'), error);
        res.status(500).send({ message: t('error_creating_user') });
    }
};

