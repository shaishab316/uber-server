import { Router } from 'express';
import { AuthControllers } from './Auth.controller';
import { AuthValidations } from './Auth.validation';
import { UserControllers } from '../user/User.controller';
import { UserValidations } from '../user/User.validation';
import purifyRequest from '../../middlewares/purifyRequest';

const router = Router();

router.post(
  '/register',
  purifyRequest(UserValidations.register),
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

/**
 * generate new access token
 */
// router.get('/refresh-token', auth.refresh_token, AuthControllers.refreshToken);

/* Otps */

/**
 * Forget password
 */
{
  // router.post(
  //   '/reset-password-otp-send',
  //   otpLimiter,
  //   purifyRequest(OtpValidations.email),
  //   UserMiddlewares.useUser(),
  //   OtpControllers.resetPasswordOtpSend,
  // );
  // router.post(
  //   '/reset-password-otp-verify',
  //   otpLimiter,
  //   purifyRequest(OtpValidations.email, OtpValidations.otp),
  //   UserMiddlewares.useUser(),
  //   OtpControllers.resetPasswordOtpVerify,
  // );
  // router.post(
  //   '/reset-password',
  //   auth.reset(),
  //   purifyRequest(AuthValidations.resetPassword),
  //   AuthControllers.resetPassword,
  // );
}

// router.get(
//   '/account-verify-otp-send',
//   otpLimiter,
//   auth.guest(),
//   OtpControllers.accountVerifyOtpSend,
// );

export const AuthRoutes = router;
