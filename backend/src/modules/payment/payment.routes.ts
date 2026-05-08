import { Router } from 'express';
import * as stripeController from './stripe.controller';
import { isAuthenticated } from '../../middleware/auth.middleware';

const router = Router();

router.post('/checkout/create-session', isAuthenticated, stripeController.createCheckoutSession);

//webhook routes requires raw body parser//
//no json parse is to be done for webhook 


export default router;


