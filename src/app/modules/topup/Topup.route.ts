import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { TopupValidations } from './Topup.validation';
import { TopupControllers } from './Topup.controller';
import auth from '../../middlewares/auth';
import { AzulValidation } from '../azul/Azul.validation';

const router = Router();

/**
 * Generate a topup link for the authenticated user.
 */
router.post(
  '/generate-link',
  auth.all,
  purifyRequest(TopupValidations.generateTopupLink),
  TopupControllers.generateTopupLink,
);

/**
 * Handle the checkout session for a topup. Validates the session query parameter and processes the payment flow based on the provider specified in the topup session. Currently supports AZUL as a payment provider.
 */
router.get(
  '/checkout',
  purifyRequest(TopupValidations.checkoutSession),
  TopupControllers.checkoutSession,
);

/**
 * Endpoint to handle the redirect from AZUL after payment processing. Validates the incoming query parameters using the AzulValidation schema and verifies the payment by checking the authenticity of the data and ensuring that the transaction was successful.
 */
router.get(
  '/azul-verify-payment',
  purifyRequest(AzulValidation.verifyPayment),
  TopupControllers.verifyPayment,
);

export const TopupRoutes = router;
