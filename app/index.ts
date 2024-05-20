import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import userRouter from '../app/routes/user.route';
import stadiumRouter from '../app/routes/stadium.route';
import authRouter from '../app/routes/auth.route'
import bodyParser from 'body-parser';
dotenv.config({ path: '.env' });

import passport from 'passport'; 
import '../passport-config'; 
import cookieParser from 'cookie-parser';
import cors from 'cors';

export const app: Application = express();

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const server = http.createServer(app);

// Fonction pour attendre un certain délai
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fonction de connexion avec réessai
const connectWithRetry = async (retries: number, delay: number) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || '', {
        serverSelectionTimeoutMS: 5000 // nombre de millisecondes avant de générer une erreur de sélection de serveur
      });
      console.log('Connected to MongoDB');
      return;
    } catch (error:any) {
      console.error(`Error occurred while connecting to MongoDB (attempt ${i + 1}/${retries}):`, error.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await wait(delay);
      }
    }
  }
  throw new Error('Failed to connect to MongoDB after multiple attempts');
};

// Nombre de tentatives et délai entre les tentatives
const maxRetries = 5; // nombre de tentatives
const retryDelay = 5000; // délai en millisecondes

connectWithRetry(maxRetries, retryDelay)
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch(error => {
    console.error('Could not start the server due to MongoDB connection issues:', error.message);
  });

// Initiation des routes
app.use('/api/v1', userRouter);
app.use('/api/v1', stadiumRouter);
app.use('/api/v1', authRouter);
