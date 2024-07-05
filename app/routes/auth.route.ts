import express from 'express';
import {loginUser, logout, signup, refreshToken, incommingcall } from '../controllers/auth.controller';

const router = express.Router();
/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Connexion d'un utilisateur
 *     description: Permet à un utilisateur de se connecter en utilisant son email et son mot de passe.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *               description: L'email de l'utilisateur.
 *             password:
 *               type: string
 *               format: password
 *               description: Le mot de passe de l'utilisateur.
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         schema:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *             refreshToken:
 *               type: string
 *             xsrfToken:
 *               type: string
 *             user:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 lastname:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Informations d'identification invalides ou manquantes
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /logout:
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Déconnexion d'un utilisateur
 *     description: Permet à un utilisateur de se déconnecter en supprimant les cookies de session.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       400:
 *         description: Aucun utilisateur connecté à déconnecter
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/logout', logout);
router.post('/signup', signup);

router.post('/refresh-token', refreshToken);

/**
 * @swagger
 * /incommingcall:
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Gérer un appel entrant
 *     description: Enregistre les détails d'un appel entrant.
 *     produces:
 *       - application/json
 *     requestBody:
 *       description: Détails de l'appel entrant
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               callerId:
 *                 type: string
 *               callTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Appel entrant enregistré avec succès
 *       500:
 *         description: Erreur interne du serveur
 */

router.post('/incommingcall', incommingcall);

export default router;
