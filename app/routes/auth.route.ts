import express from 'express';
import {loginUser, logout, signup, refreshToken, verifyToken } from '../controllers/auth.controller';

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', logout);
router.post('/signup', signup);
router.post('/refresh-token', refreshToken);
router.get('/verify-token', verifyToken);

export default router;
