import express from 'express';
import {detailComplexe, listUpdate, addRating, rating} from '../controllers/complexe.controller';
import {auth, checkAuthentication} from '../middlewares/auth.middleware';

const router = express.Router();

// Ajouter ou mettre à jour une note à un complexe sportif
router.post('/ratingStadium', [auth], addRating);

// Récupérer les notes d'un complexe sportif
router.get('/ratingStadium', [checkAuthentication], rating);

// Lister les complexes sportif optimiser en fonction des coordonées centrées
router.get('/stadiums', listUpdate);

// Afficher le detail d'un complexe sportif
router.get('/stadium', detailComplexe);

export default router;
