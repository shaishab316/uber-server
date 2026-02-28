import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { TopupValidations } from './Topup.validation';
import { TopupControllers } from './Topup.controller';
import auth from '../../middlewares/auth';

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

export const TopupRoutes = router;
