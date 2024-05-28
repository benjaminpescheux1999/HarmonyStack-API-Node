import User from '../models/user.model';
import RefreshToken from '../models/refreshToken.model';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { generateBase64RefreshToken, generateXsrfToken, hashPassword } from '../services/hash.service';

export const auth = async (req: { user?: any; cookies?: any; headers?: any; }, res: Response, next: NextFunction) => {
    try {
        const { cookies, headers } = req;
         
        /* On vérifie que le token CSRF est présent dans les en-têtes de la requête */
        if (!headers || !headers['x-xsrf-token']) {
            return res.status(401).send({ message: 'Missing XSRF token in headers' });
        }
    
        const xsrfToken = headers['x-xsrf-token'];

        /* On vérifie que le JWT est présent dans les cookies de la requête */
        if (!cookies || !cookies.access_token) {
            return res.sendStatus(401);
            // return res.status(401).send({ message: 'Missing token in cookie' });
        }
    
        const accessToken = cookies.access_token;
        // const refreshToken = req.cookies['refresh_token'];
    
        /* On vérifie et décode le JWT à l'aide du secret et de l'algorithme utilisé pour le générer */
        // Fonction pour vérifier et décoder le token JWT
        const verifyAccessToken = (accessToken: string, jwtSecret: string): jwt.JwtPayload | null => {
            try {
                // Vérifie et décode le JWT à l'aide du secret et de l'algorithme utilisé pour le générer
                const decodedToken = jwt.verify(accessToken, jwtSecret) as jwt.JwtPayload;
                // Retourne un tuple avec un booléen true pour indiquer que la vérification est réussie
                // et le payload décrypté du token JWT
                return decodedToken;
            } catch (error) {
                // En cas d'erreur, retourne un tuple avec un booléen false pour indiquer que la vérification a échoué
                // et null comme payload décrypté
                return null;
            }
        };
        // Utilisation de la fonction pour vérifier et décoder le token JWT
        const decodedToken = verifyAccessToken(accessToken, String(process.env.JWT_SECRET));
        
        if (!decodedToken) {
            return res.sendStatus(401);
            // return res.status(401).send({ message: 'Invalid token' });
        }

        /* On vérifie que le token CSRF correspond à celui présent dans le JWT  */  
        if (String(xsrfToken) !== String(decodedToken.xsrfToken)) {            
            return res.sendStatus(401);
            // return res.status(401).send({ message: 'Bad xsrf token' });
        }
    
        /* On vérifie que l'utilisateur existe bien dans notre base de données */
        const userId = decodedToken.sub;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).send({ message: `User ${userId} not exists` });
        }
    
        /* On passe l'utilisateur dans notre requête afin que celui-ci soit disponible pour les prochains middlewares */
        req.user = user;
        /* Calcul du temps restant du token en minutes */
        // const expirationTime = decodedToken && decodedToken.exp && decodedToken.exp * 1000; // Convertir l'expiration en millisecondes
        // const currentTime = new Date().getTime(); // Temps actuel en millisecondes
        // const timeRemaining = expirationTime && Math.ceil((expirationTime - currentTime) / 60000); // Conversion en minutes et arrondissement
        return next();
    } catch (err) {
        console.log('Error:', err); 
        return res.status(500).send({ message: 'Internal error' });
    }
}

export const checkAuthentication = async (req: { user?: any; cookies?: any; headers?: any; cookiesToSet?:any; additionalData?:any }, res: Response, next: NextFunction) => {
    try {
        const { cookies, headers } = req;

        // Vérifier la présence du refresh token
        const refreshToken = cookies && cookies['refresh_token'];
        
        if (!refreshToken) {
            req.user = null;
            return next();
        }

        // Fonction de vérification de l'access token
        const verifyAccessToken = (accessToken: string, jwtSecret: string): jwt.JwtPayload | null => {
            try {
                const decodedToken = jwt.verify(accessToken, jwtSecret) as jwt.JwtPayload;
                // console.log('Decoded token:', decodedToken);
                
                return decodedToken;
            } catch (error) {
                return null;
            }
        };

        // Vérifier la présence du xsrf token et de l'access token
        const xsrfToken = headers && headers['x-xsrf-token'];
        
        let accessToken = cookies && cookies['access_token'];
        
        let decodedToken = accessToken ? verifyAccessToken(accessToken, String(process.env.JWT_SECRET)) : null;
        
        // Si l'access token est invalide ou absent, vérifier le refresh token
        if (!decodedToken) {
            const validRefresh = await RefreshToken.findOne({ refreshToken });
            
            if (!validRefresh || !validRefresh.userId || (validRefresh.expiresAt && validRefresh.expiresAt < new Date())) {
                req.user = null;
                return next();
            }

            // Générer un nouveau access token et refresh token
            const userId = validRefresh.userId;
            const user = await User.findById(userId);
            if (!user) {
                req.user = null;
                return next();
            }

            const newXsrfToken = await generateXsrfToken();
            const newRefreshToken = await generateBase64RefreshToken();
            const newaccessToken = jwt.sign({ sub: String(validRefresh.userId), xsrfToken: newXsrfToken }, String(process.env.JWT_SECRET), { expiresIn: '10m' });

            const query = { userId: validRefresh.userId };
            const update = { $set: { refreshToken: newRefreshToken, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }};
            const options = { upsert: true };
            await RefreshToken.updateOne(query, update, options);

            // Définir les nouveaux tokens dans les cookies
            req.cookiesToSet = {
                access_token: {
                    value: newaccessToken,
                    options: {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 10 * 60 * 1000, // 10 minutes
                        sameSite: 'strict',
                        path: '/'
                    }
                },
                refresh_token: {
                    value: newRefreshToken,
                    options: {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 365 * 24 * 60 * 60 * 1000,
                        sameSite: 'strict',
                        path: '/'
                    }
                }
            };
            req.additionalData = {
                accessTokenExpiresIn: 10 * 60 * 1000, // 10 minutes
                refreshTokenExpiresIn: 365 * 24 * 60 * 60 * 1000,
                xsrfToken
            };
                        
            req.user = user;
            return next();
        }

        console.log('XSRF token:', xsrfToken);
        console.log('decodedToken xsrfToken:', decodedToken.xsrfToken);
        // Vérifier que le xsrf token correspond à celui présent dans le JWT
        if (xsrfToken && String(xsrfToken) !== String(decodedToken.xsrfToken)) {
            req.user = null;
            return next();
        }

        // Vérifier que l'utilisateur existe dans la base de données
        const userId = decodedToken.sub;
        const user = await User.findById(userId);
        req.user = user || null;
        return next();
    } catch (err) {
        console.log('Error:', err);
        return res.status(500).send({ message: 'Internal error' });
    }
}
