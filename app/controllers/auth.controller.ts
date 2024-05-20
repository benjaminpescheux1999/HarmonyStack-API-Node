import { NextFunction, Request, Response } from 'express';
import { RefreshToken, User } from '../models/index.model';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import passport from 'passport';
import { generateBase64RefreshToken, generateXsrfToken, hashPassword } from '../services/hash.service';
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
dotenv.config(); // Charger les variables d'environnement

// import stripe from 'stripe';
// console.log("key ==>",String(process.env.STRIPE_SECRET_KEY));

// const stripeInstance = new stripe(String(process.env.STRIPE_SECRET_KEY));


export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, lastname, email, password } = req.body;
        
        if (!username || !lastname || !email || !password) {
            res.status(400).json({ error: 'Tous les champs sont requis' });
            return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'Cet email est déjà utilisé' });
            return;
        }

        const hashedPassword = hashPassword(password);
        
        const newUser = new User({
            username,
            lastname,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();
        
        res.status(201).json(savedUser);
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
        res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
    }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', { session: false }, async (err: Error, user: { _id: string; }, info: { message: any; }) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de l\'authentification' });
        }
        if (!user) {
            return res.status(400).json({ error: info && info.message ? info.message : 'Échec de l\'authentification' });
        }

        /* On créer le token CSRF */
        const xsrfToken = await generateXsrfToken();
         /* On créer le JWT avec le token CSRF dans le payload */
        const accessToken = jwt.sign({ sub: user._id, xsrfToken }, String(process.env.JWT_SECRET), { expiresIn: '1h' });

        const refreshToken = await generateBase64RefreshToken();
        
        //add refresh token 
        const query = { userId: user._id };
        const update = { $set: { refreshToken: refreshToken, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }};
        const options = { upsert: true };
        await RefreshToken.updateOne(query, update, options);

        const includeUserFields = ['_id', 'username', 'lastname', 'email'];
        const userInfos = await User.findById(user._id, includeUserFields);
        /* On créer le cookie contenant le JWT */
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1 * 60 * 60 * 1000, //1 heure
            sameSite: 'strict',
            path: '/',
        }).cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 365 * 24 * 60 * 60 * 1000, //1 an
            path: '/',
            sameSite: 'strict'
        })
        .send({
            accessTokenExpiresIn: 24 * 60 * 60 * 1000,
            refreshTokenExpiresIn: 365 * 24 * 60 * 60 * 1000,
            xsrfToken,
            user:userInfos
          })
    })(req, res, next);
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const { cookies } = req;
    if(!cookies || !cookies.refresh_token) {
        return res.status(401).json({ message: 'Refresh token is required' });
    }
    const refreshToken = cookies.refresh_token;
    
    const validrefresh = await RefreshToken.findOne({ refreshToken });
    if (!validrefresh) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }    
    
    if(!validrefresh.userId && !validrefresh.expiresAt || (validrefresh.expiresAt && validrefresh.expiresAt < new Date())) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    /* On créer le token CSRF */
    const xsrfToken = await generateXsrfToken();
    const NewRefreshToken = await generateBase64RefreshToken();
    const accessToken = jwt.sign({ sub: String(validrefresh.userId), xsrfToken }, String(process.env.JWT_SECRET), { expiresIn: '1h' });
    //add refresh token 
    const query = { userId: validrefresh.userId };
    const update = { $set: { refreshToken: NewRefreshToken, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }};
    const options = { upsert: true };
    await RefreshToken.updateOne(query, update, options);

    /* On créer le cookie contenant le JWT */
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1 * 60 * 60 * 1000, //1 heure
        sameSite: 'strict',
        path: '/',
    }).cookie('refresh_token', NewRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 365 * 24 * 60 * 60 * 1000, //1 an
        path: '/',
        sameSite: 'strict'
    }).send({
        accessTokenExpiresIn: 24 * 60 * 60 * 1000,
        refreshTokenExpiresIn: 365 * 24 * 60 * 60 * 1000,
        xsrfToken
    })
}

export const signup = async (req: Request, res: Response) => {
    const { email, password, firstname, lastname, passwordConfirmation } = req.body;
    console.log("req.body",req.body);
    
    if (!email || !password || !firstname || !lastname || !passwordConfirmation) {
        return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    if (password !== passwordConfirmation) {
        return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        const hashedPassword = await hashPassword(password);
        console.log("hashedPassword",hashedPassword);
        
        const newUser = new User({
            email,
            password: hashedPassword,
            username:firstname,
            lastname,
        });
        const savedUser = await newUser.save();
        return res.status(201).json(savedUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' });
    }
}

export const logout = async (req: Request, res: Response) => {
    try {
        const { cookies } = req;
        if (cookies && cookies.refresh_token) {
            await RefreshToken.deleteOne({ refreshToken: cookies.refresh_token });
        }
        res.clearCookie('access_token').clearCookie('refresh_token').send({ message: 'Déconnexion réussie' });
    } catch (error) {
        
    }
}

// export const payment = async (req: Request, res: Response) => {
//     console.log("body",req.body);
//     try {
//         const { amount, token } = req.body;
//         const charge = await stripeInstance.charges.create({
//             amount,
//             currency: 'usd',
//             description: 'Example charge',
//             source: token.id,
//           });

//         console.log("paymentIntent",charge);
        
//         res.json({ client_secret: charge });
//       } catch (error:any) {
//         console.error(error.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//       }
// }

// export const getProducts = async (req: Request, res: Response) => {
//     try {
//         let products = await stripeInstance.prices.list({
//             active: true,
//             expand: ['data.product'],
//         });
//         const prices = products.data; // Obtenir le tableau de prix à partir de la réponse

//         const prixActifs = prices.filter((price: any) => price.product.active === true);
//         console.log("prixActifs",prixActifs.length);
        
//         res.json({products: prixActifs});
//     } catch (error:any) {
//         console.error(error.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }

// export const infoProduct = async (req: Request, res: Response) => {
//     try {        
//         const { id } = req.params;
//         const product = await stripeInstance.prices.retrieve(id,{
//             expand: ['product'],
//         });
//         res.json(product);
//     } catch (error:any) {
//         console.error(error.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }

// export const create_payment_intent = async (req: Request, res: Response) => {
//     const { custumerId, amount, currency, price } = req.body; // Récupérer les items envoyés depuis le frontend
//     console.log("priceId",price);
    
//     try {
//         const paymentIntent = await stripeInstance.paymentIntents.create({
            
//             amount: amount,
//             currency: currency,
//             payment_method_types: ['card'],
//             metadata: {
//                 offerId: custumerId,
//             },
//         });
        
//         // Envoyer le clientSecret en réponse
//         res.status(200).send({clientSecret: paymentIntent.client_secret });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Une erreur s\'est produite lors de la création de l\'intent de paiement' });
//     }

// }

// export const pricing_table = async (req: Request, res: Response) => {
//     try {
//         return res.status(200).send({PRICING_TABLE_ID:process.env.pricing_table_id});
//     } catch (error) {
        
//     }
// }

// export const suscribeplan = async (req: Request, res: Response) => {
//     const { custumerId, amount, currency, price } = req.body; // Récupérer les items envoyés depuis le frontend

//     try {
//         const subscription = await stripeInstance.subscriptions.create({
//             customer: custumerId,
//             items: [
//               {
//                 price: price,
//               },
//             ],
//           });
//     } catch (error) {
        
//     }
// }

// function calculateOrderAmount() {
//     // Calculer le montant total de la commande en fonction des articles
//     return 1000; // Par exemple, 10€ en centimes
// }