/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import ServerError from '../../errors/ServerError';
import { decodeToken, TToken } from '../modules/auth/Auth.utils';
import catchAsync from './catchAsync';
import { prisma } from '../../util/db';
import { EUserRole, User as TUser } from '../../../prisma';

/**
 * Middleware to authenticate and authorize requests based on user roles
 *
 * @param roles - The roles that are allowed to access the resource
 */
const auth = ({
  token_type = 'access_token',
  validators = [],
}: {
  token_type?: TToken;
  validators?: ((user: TUser) => void)[];
} = {}) =>
  catchAsync(async (req, _, next) => {
    const token = req.headers.authorization || req.cookies[token_type];

    const id = decodeToken(token, token_type)?.uid;

    if (!id)
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'Your session has expired. Login again.',
      );

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user)
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'Maybe your account has been deleted. Register again.',
      );

    for (const validator of validators) validator(user);

    req.user = user;

    next();
  });

auth.all = auth();

auth.admin = auth({
  validators: [
    commonValidator,
    user => {
      if (!user.is_admin) {
        throw new ServerError(StatusCodes.UNAUTHORIZED, 'You are not an admin');
      }
    },
  ],
});

auth.user = auth({
  validators: [
    commonValidator,
    user => {
      if (user.role !== EUserRole.USER) {
        throw new ServerError(StatusCodes.UNAUTHORIZED, 'You are not a user');
      }
    },
  ],
});

auth.driver = auth({
  validators: [
    commonValidator,
    user => {
      if (user.role !== EUserRole.DRIVER) {
        throw new ServerError(StatusCodes.UNAUTHORIZED, 'You are not a driver');
      }
    },
  ],
});

//! Token Verification
auth.refresh_token = auth({ token_type: 'refresh_token' });
auth.reset_token = auth({ token_type: 'reset_token' });

export default auth;

function commonValidator({ is_admin, is_verified, is_active }: TUser) {
  if (is_admin) return;

  if (!is_verified) {
    throw new ServerError(
      StatusCodes.UNAUTHORIZED,
      'Your account are not verified',
    );
  } else if (!is_active) {
    throw new ServerError(
      StatusCodes.UNAUTHORIZED,
      'Your account are not active',
    );
  }
}
