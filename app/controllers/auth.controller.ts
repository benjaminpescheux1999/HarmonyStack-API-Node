import { NextFunction, Request, Response } from 'express';
import { RefreshToken, User } from '../models/index.model';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import passport from 'passport';
import { generateBase64RefreshToken, generateXsrfToken, hashPassword } from '../services/hash.service';

dotenv.config();

export const loginUser = async (req: Request & { t?:any }, res: Response, next: NextFunction) => {
    const t = req.t;
    passport.authenticate('local', { session: false }, async (err: Error, user: { _id: string; }, info: { message: any; }) => {
        if (err) {
            return res.status(500).send({ message: t('authentication_error') });
        }
        if (!user) {
            return res.status(400).send({ message: info && info.message ? info.message : t('authentication_failed') });
        }
        /* Create the CSRF token */
        const xsrfToken = await generateXsrfToken();
         /* Create the JWT with the CSRF token in the payload */
        const accessToken = jwt.sign({ sub: user._id, xsrfToken }, String(process.env.JWT_SECRET), { expiresIn: '1h' });

        const refreshToken = await generateBase64RefreshToken();
        
        //add refresh token 
        const query = { userId: user._id };
        const update = { $set: { refreshToken: refreshToken, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }};
        const options = { upsert: true };
        await RefreshToken.updateOne(query, update, options);

        const includeUserFields = ['_id', 'username', 'lastname', 'email'];
        const userInfos = await User.findById(user._id, includeUserFields);
        /* Create the cookie containing the JWT */
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1 * 60 * 60 * 1000, //1 hour
            sameSite: 'strict',
            path: '/',
        }).cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 365 * 24 * 60 * 60 * 1000, //1 year
            path: '/',
            sameSite: 'strict'
        })
        .send({
            accessTokenExpiresIn: 24 * 60 * 60 * 1000, //1 day
            refreshTokenExpiresIn: 365 * 24 * 60 * 60 * 1000, //1 year
            xsrfToken,
            user:userInfos
          })
    })(req, res, next);
};

export const refreshToken = async (req: Request & { t?:any }, res: Response) => {
    const t = req.t;
    try {
        const { cookies } = req;
        if (!cookies || !cookies.refresh_token) {
            return res.status(401).send({ message: t('refresh_token_required') });
        }
        const refreshToken = cookies.refresh_token;
        const validrefresh = await RefreshToken.findOne({ refreshToken });
        if (!validrefresh) {
            return res.status(401).send({ message: t('invalid_refresh_token') });
        }    
        
        if (!validrefresh.userId || !validrefresh.expiresAt || (validrefresh.expiresAt && validrefresh.expiresAt < new Date())) {
            return res.status(401).send({ message: t('invalid_or_expired_refresh_token') });
        }
        
        /* Create the CSRF token */
        const xsrfToken = await generateXsrfToken();
        const NewRefreshToken = await generateBase64RefreshToken();
        const accessToken = jwt.sign({ sub: String(validrefresh.userId), xsrfToken }, String(process.env.JWT_SECRET), { expiresIn: '1h' });
        //add refresh token 
        const query = { userId: validrefresh.userId };
        const update = { $set: { refreshToken: NewRefreshToken, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }};
        const options = { upsert: true };
        await RefreshToken.updateOne(query, update, options);

        /* Create the cookie containing the JWT */
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1 * 60 * 60 * 1000, //1 hour
            sameSite: 'strict',
            path: '/',
        }).cookie('refresh_token', NewRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 365 * 24 * 60 * 60 * 1000, //1 year
            path: '/',
            sameSite: 'strict'
        }).send({
            accessTokenExpiresIn: 24 * 60 * 60 * 1000, //1 day
            refreshTokenExpiresIn: 365 * 24 * 60 * 60 * 1000, //1 year
            xsrfToken
        });
    } catch (error) {
        console.log(t('internal_server_error_on_token_refresh'), error);
        return res.status(500).send({ message: t('internal_server_error_on_token_refresh') });
    }
}

export const signup = async (req: Request & {t?:any}, res: Response) => {
    const t = req.t;
    const { email, password, username, lastname, passwordConfirmation } = req.body;
    console.log("req.body",req.body);
    
    if (!email || !password || !username || !lastname || !passwordConfirmation) {
        return res.status(400).send({ message: t('all_fields_required') });
    }
    if (password !== passwordConfirmation) {
        return res.status(400).send({ message: t('passwords_do_not_match') });
    }

    //start a session
    const session = await User.startSession();
    session.startTransaction();

    try {
        const existingUser = await User.findOne({ email }).session(session);
        if (existingUser) {
            // if the email already exists, abort the transaction and end the session
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send({ message: t('email_already_used') });
        }

        const hashedPassword = await hashPassword(password);
        
        const newUser = new User({
            email,
            password: hashedPassword,
            username: username,
            lastname,
        });

        const savedUser = await newUser.save({ session });

        const xsrfToken = await generateXsrfToken();
         /* Create the JWT with the CSRF token in the payload */
        const accessToken = jwt.sign({ sub: newUser._id, xsrfToken }, String(process.env.JWT_SECRET), { expiresIn: '1h' });
        const refreshToken = await generateBase64RefreshToken();

        const query = { userId: newUser._id };
        const update = { $set: { refreshToken: refreshToken, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }};
        const options = { upsert: true };
        await RefreshToken.updateOne(query, update, options).session(session);
        //commit the transaction
        await session.commitTransaction();
        session.endSession();

        const includeUserFields = ['_id', 'username', 'lastname', 'email'];
        const userInfos = await User.findById(newUser._id, includeUserFields);

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1 * 60 * 60 * 1000, //1 hour
            sameSite: 'strict',
            path: '/',
        }).cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 365 * 24 * 60 * 60 * 1000, //1 year
            path: '/',
            sameSite: 'strict'
        })
        .send({
            accessTokenExpiresIn: 24 * 60 * 60 * 1000, //1 day
            refreshTokenExpiresIn: 365 * 24 * 60 * 60 * 1000, //1 year
            xsrfToken,
            user: userInfos
        });
    } catch (error) {
        //if there is an error, abort the transaction and end the session
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        return res.status(500).send({ message: t('error_creating_user') });
    }
}

export const logout = async (req: Request & {t?:any}, res: Response) => {
    const t = req.t;
    try {
        const { cookies } = req;
        if (cookies && cookies.refresh_token) {
            await RefreshToken.deleteOne({ refreshToken: cookies.refresh_token });
        }
        res.clearCookie('access_token').clearCookie('refresh_token').send({ message: t('logout_successful') });
    } catch (error) {
        console.error(t('logout_error'), error);
        return res.status(500).send({ message: t('logout_error') });
    }
}
