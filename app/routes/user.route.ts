import express, { Request, Response } from 'express';
// import { createUser, create_payment_intent, getProducts, infoProduct, payment, pricing_table } from '../controllers/auth.controller';
import {auth} from '../middlewares/auth.middleware';

const router = express.Router();

// router.post('/payment', payment);
// router.get('/products', getProducts);
// router.get('/plan/:id', infoProduct);
// router.post('/create-payment-intent', create_payment_intent);
  
// router.get('/pricing_table', pricing_table)

// router.post('/user', createUser);

router.get('/user', [auth], (req: Request, res: Response) => {        
    res.status(200).send({ user: req.user });
});


export default router;
