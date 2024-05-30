import User from '../models/user.model';
import RefreshToken from '../models/refreshToken.model';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { generateBase64RefreshToken, generateXsrfToken } from '../services/hash.service';

export const auth = async (req: { user?: any; cookies?: any; headers?: any; t?:any }, res: Response, next: NextFunction) => {
    const t = req.t;
    try {
        const { cookies, headers } = req;
         
        /* Check if the CSRF token is present in the request headers */
        if (!headers || !headers['x-xsrf-token']) {
            return res.status(401).send({ message: t('middleware_auth.missing_xsrf_token') });
        }
    
        const xsrfToken = headers['x-xsrf-token'];

        /* Check if the JWT is present in the request cookies */
        if (!cookies || !cookies.access_token) {
            return res.status(401).send({ message: t('middleware_auth.missing_token_in_cookie') });
        }
    
        const accessToken = cookies.access_token;
    
        const verifyAccessToken = (accessToken: string, jwtSecret: string): jwt.JwtPayload | null => {
            try {
                const decodedToken = jwt.verify(accessToken, jwtSecret) as jwt.JwtPayload;
                return decodedToken;
            } catch (error) {
                return null;
            }
        };

        const decodedToken = verifyAccessToken(accessToken, String(process.env.JWT_SECRET));
        
        if (!decodedToken) {
            return res.status(401).send({ message: t('middleware_auth.invalid_token') });
        }

        if (String(xsrfToken) !== String(decodedToken.xsrfToken)) {            
            return res.status(401).send({ message: t('middleware_auth.bad_xsrf_token') });
        }
    
        const userId = decodedToken.sub;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).send({ message: t('middleware_auth.user_not_exists', { userId }) });
        }
    
        req.user = user;
        return next();
    } catch (err) {
        console.log('Error:', err); 
        return res.status(500).send({ message: t('internal_server_error') });
    }
}

export const checkAuthentication = async (req: { user?: any; cookies?: any; headers?: any; cookiesToSet?:any; additionalData?:any; t?:any }, res: Response, next: NextFunction) => {
    const t = req.t;
    try {
        const { cookies, headers } = req;

        const refreshToken = cookies && cookies['refresh_token'];
        
        if (!refreshToken) {
            req.user = null;
            return next();
        }

        const verifyAccessToken = (accessToken: string, jwtSecret: string): jwt.JwtPayload | null => {
            try {
                const decodedToken = jwt.verify(accessToken, jwtSecret) as jwt.JwtPayload;
                return decodedToken;
            } catch (error) {
                return null;
            }
        };

        const xsrfToken = headers && headers['x-xsrf-token'];
        
        let accessToken = cookies && cookies['access_token'];
        
        let decodedToken = accessToken ? verifyAccessToken(accessToken, String(process.env.JWT_SECRET)) : null;
        
        if (!decodedToken) {
            const validRefresh = await RefreshToken.findOne({ refreshToken });
            
            if (!validRefresh || !validRefresh.userId || (validRefresh.expiresAt && validRefresh.expiresAt < new Date())) {
                req.user = null;
                return next();
            }

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
                        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
                        sameSite: 'strict',
                        path: '/'
                    }
                }
            };
            req.additionalData = {
                accessTokenExpiresIn: 10 * 60 * 1000, // 10 minutes
                refreshTokenExpiresIn: 365 * 24 * 60 * 60 * 1000, // 1 year
                xsrfToken
            };
                        
            req.user = user;
            return next();
        }

        if (xsrfToken && String(xsrfToken) !== String(decodedToken.xsrfToken)) {
            req.user = null;
            return next();
        }

        const userId = decodedToken.sub;
        const user = await User.findById(userId);
        req.user = user || null;
        return next();
    } catch (err) {
        console.log('Error:', err);
        return res.status(500).send({ message: t('internal_server_error') });
    }
}
