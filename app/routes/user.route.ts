import express, { Request, Response } from 'express';
import {auth} from '../middlewares/auth.middleware';
import { getUser, updateUser } from '../controllers/user.controller';

const router = express.Router();

/**
 * @swagger
 * /user:
 *  get:
 *   tags:
 *     - User
 *   summary: Récupérer les informations de l'utilisateur
 *   description: Permet de récupérer les informations détaillées de l'utilisateur connecté.
 *   responses:
 *     200:
 *       description: Informations de l'utilisateur récupérées avec succès
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Justine"
 *               lastname:
 *                 type: string
 *                 example: "Cailly123"
 *               email:
 *                 type: string
 *                 example: "j.c@gmail.com"
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-04-19T15:16:50.081Z"
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-05-24T15:04:04.246Z"
 *               __v:
 *                 type: integer
 *                 example: 0
 *     401:
 *       description: Non autorisé, authentification requise
 *     404:
 *       description: Utilisateur non trouvé
 *     500:
 *       description: Erreur interne du serveur
 */
router.get('/user', [auth], getUser)

/**
 * @swagger
 * /user:
 *  put:
 *   tags:
 *     - User
 *   summary: Mettre à jour les informations de l'utilisateur
 *   description: Permet de mettre à jour les informations de l'utilisateur connecté. Le mot de passe ne peut être mis à jour que si l'ancien mot de passe est fourni et correct.
 *   consumes:
 *     - application/json
 *   produces:
 *     - application/json
 *   parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - username
 *           - lastname
 *           - email
 *         properties:
 *           username:
 *             type: string
 *             description: Nom d'utilisateur
 *           lastname:
 *             type: string
 *             description: Nom de famille
 *           email:
 *             type: string
 *             format: email
 *             description: Adresse email
 *           old_password:
 *             type: string
 *             format: password
 *             description: Ancien mot de passe, nécessaire pour mettre à jour le mot de passe.
 *           password:
 *             type: string
 *             format: password
 *             description: Nouveau mot de passe, requis si old_password est fourni et non vide.
 *   responses:
 *     200:
 *       description: Informations de l'utilisateur mises à jour avec succès
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     400:
 *       description: Données invalides ou manquantes
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *               label:
 *                 type: string
 *     401:
 *       description: Non autorisé, authentification requise
 *     404:
 *       description: Utilisateur non trouvé
 *     500:
 *       description: Erreur interne du serveur
 */
router.put('/user', [auth], updateUser)


export default router;

