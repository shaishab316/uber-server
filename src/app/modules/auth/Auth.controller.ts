import { AuthServices } from './Auth.service';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../utils/server/serveResponse';
import { TToken, verifyPassword } from './Auth.utils';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';

export const AuthControllers = {
  login: catchAsync(async ({ body }, res) => {
    const user = await AuthServices.login(body);

    const { access_token, refresh_token } = AuthServices.retrieveToken(
      user.id!,
      'access_token',
      'refresh_token',
    );

    AuthServices.setTokens(res, { access_token, refresh_token });

    serveResponse(res, {
      message: 'Login successfully!',
      data: { access_token, refresh_token, user },
    });
  }),

  accountVerifyOtpSend: catchAsync(async ({ body }, res) => {
    const data = await AuthServices.accountVerifyOtpSend(body);

    serveResponse(res, {
      message: 'OTP sent successfully!',
      data,
    });
  }),

  accountVerify: catchAsync(async ({ body }, res) => {
    const user = await AuthServices.accountVerify(body);

    const { access_token, refresh_token } = AuthServices.retrieveToken(
      user.id!,
      'access_token',
      'refresh_token',
    );

    AuthServices.setTokens(res, { access_token, refresh_token });

    serveResponse(res, {
      message: 'Account verified successfully!',
      data: { user, access_token, refresh_token },
    });
  }),

  forgotPasswordOtpVerify: catchAsync(async ({ body }, res) => {
    const user = await AuthServices.accountVerify(body);

    const { reset_token } = AuthServices.retrieveToken(user.id!, 'reset_token');

    AuthServices.setTokens(res, { reset_token });

    serveResponse(res, {
      message: 'OTP verified successfully!',
      data: { user, reset_token },
    });
  }),

  forgotPassword: catchAsync(async ({ body }, res) => {
    const data = await AuthServices.forgotPassword(body);

    serveResponse(res, {
      message: 'OTP sent successfully!',
      data,
    });
  }),

  resetPassword: catchAsync(async ({ user, body }, res) => {
    if (await verifyPassword(body.password, user.password)) {
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'You cannot use old password',
      );
    }

    await AuthServices.modifyPassword({
      userId: user.id,
      password: body.password,
    });

    const { access_token, refresh_token } = AuthServices.retrieveToken(
      user.id,
      'access_token',
      'refresh_token',
    );

    AuthServices.setTokens(res, { access_token, refresh_token });
    AuthServices.destroyTokens(res, 'reset_token');

    serveResponse(res, {
      message: 'Password reset successfully!',
      data: { access_token, refresh_token, user },
    });
  }),

  changePassword: catchAsync(async ({ user, body }, res) => {
    if (!(await verifyPassword(body.oldPassword, user.password))) {
      throw new ServerError(StatusCodes.UNAUTHORIZED, 'Incorrect password');
    }

    if (body.oldPassword === body.newPassword) {
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'You cannot use old password',
      );
    }

    await AuthServices.modifyPassword({
      userId: user.id,
      password: body.newPassword,
    });

    serveResponse(res, {
      message: 'Password changed successfully!',
    });
  }),

  logout: catchAsync(async ({ cookies }, res) => {
    AuthServices.destroyTokens(res, ...(Object.keys(cookies) as TToken[]));

    serveResponse(res, {
      message: 'Logged out successfully!',
    });
  }),

  /*

  refreshToken: catchAsync(async ({ user }, res) => {
    const { access_token } = AuthServices.retrieveToken(
      user.id,
      'access_token',
    );

    serveResponse(res, {
      message: 'AccessToken refreshed successfully!',
      data: { access_token },
    });
  }),

  

  */
};
