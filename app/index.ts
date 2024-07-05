import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express, { Application} from 'express';
import http from 'http';
import userRouter from '../app/routes/user.route';
import stadiumRouter from '../app/routes/stadium.route';
import authRouter from '../app/routes/auth.route'
import notificationRouter from '../app/routes/notification.route'
import bodyParser from 'body-parser';

//Swagger - documentation
import swaggerUi from 'swagger-ui-express'
import specs from '../swagger'

// i18n - translation
import i18next from '../i18n';
import i18nextMiddleware from 'i18next-http-middleware';

dotenv.config({ path: '.env' });

import passport from 'passport'; 
import '../passport-config'; 
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';

export const app: Application = express();

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Securing HTTP headers and XSS vulnerability
app.use(helmet(
  {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: true,
    dnsPrefetchControl: true,
    frameguard: true,
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: true,
    referrerPolicy: true,
    xssFilter: true,
  }
));
app.use(express.urlencoded({ extended: true }));


const server = http.createServer(app);

// Function to wait for a certain delay
//const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Connection function with retry
// const connectWithRetry = async (retries: number, delay: number) => {
//   for (let i = 0; i < retries; i++) {
//     try {
//       await mongoose.connect(process.env.MONGODB_URI || '', {
//         serverSelectionTimeoutMS: 5000
//       });
//       console.log('Connected to MongoDB');
//       return;
//     } catch (error:any) {
//       console.error(`Error occurred while connecting to MongoDB (attempt ${i + 1}/${retries}):`, error.message);
//       if (i < retries - 1) {
//         console.log(`Retrying in ${delay / 1000} seconds...`);
//         await wait(delay);
//       }
//     }
//   }
//   throw new Error('Failed to connect to MongoDB after multiple attempts');
// };

// Nombre de tentatives et délai entre les tentatives
// const maxRetries = 5; // nombre de tentatives
// const retryDelay = 5000; // délai en millisecondes

// connectWithRetry(maxRetries, retryDelay)
//   .then(() => {
//     server.listen(process.env.PORT, () => {
//       console.log(`Server is running on port ${process.env.PORT}`);
//     });
//   })
//   .catch(error => {
//     console.error('Could not start the server due to MongoDB connection issues:', error.message);
//   });

    server.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });

const options = {
  customSiteTitle: "HarmonyStack API Node",
  customJs: "/inject_lang",
};

app.use("/inject_lang", (req: express.Request, res: express.Response) => {
  res.sendFile("/services/injectionCustomSelectScript.js", {root: __dirname})
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, options));

//i18n - translation
app.use(i18nextMiddleware.handle(i18next));


// Initiation routes
app.use('/api/v1', userRouter);
app.use('/api/v1', stadiumRouter);
app.use('/api/v1', authRouter);
app.use('/api/v1', notificationRouter);

