import { Router } from 'express';
import { AuthControllers } from './Auth.controller';
import { AuthValidations } from './Auth.validation';
import { UserControllers } from '../user/User.controller';
import { UserValidations } from '../user/User.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import auth from '../../middlewares/auth';
import { ReferValidations } from '../refer/Refer.validation';

const router = Router();

router.post(
  '/register',
  purifyRequest(UserValidations.register, ReferValidations.refer),
  UserControllers.register,
);

router.post(
  '/account-verify',
  purifyRequest(AuthValidations.accountVerify),
  AuthControllers.accountVerify,
);

router.post(
  '/login',
  purifyRequest(AuthValidations.login),
  AuthControllers.login,
);

router.post(
  '/facebook-login',
  purifyRequest(AuthValidations.facebookLogin, ReferValidations.refer),
  AuthControllers.facebookLogin,
);

router.post(
  '/google-login',
  purifyRequest(AuthValidations.googleLogin, ReferValidations.refer),
  AuthControllers.googleLogin,
);

router.post(
  '/account-verify/otp-send',
  purifyRequest(AuthValidations.otpSend),
  AuthControllers.accountVerifyOtpSend,
);

router.post(
  '/forgot-password',
  purifyRequest(AuthValidations.otpSend),
  AuthControllers.forgotPassword,
);

router.post(
  '/forgot-password/otp-verify',
  purifyRequest(AuthValidations.accountVerify),
  AuthControllers.forgotPasswordOtpVerify,
);

router.post(
  '/reset-password',
  auth.reset_token,
  purifyRequest(AuthValidations.resetPassword),
  AuthControllers.resetPassword,
);

router.post('/logout', auth.all, AuthControllers.logout);

/**
 * generate new access token
 */
router.get('/refresh-token', auth.refresh_token, AuthControllers.refreshToken);

export const AuthRoutes = router;
