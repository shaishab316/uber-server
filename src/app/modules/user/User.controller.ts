import { UserServices } from './User.service';
import catchAsync from '../../middlewares/catchAsync';
import { StatusCodes } from 'http-status-codes';
import { AuthServices } from '../auth/Auth.service';
import { EUserRole, User as TUser } from '../../../../prisma';
import { prisma } from '../../../utils/db';
import ServerError from '../../../errors/ServerError';

export const UserControllers = {
  register: catchAsync(async ({ body }, res) => {
    const user = await UserServices.create(body);

    const { access_token, refresh_token } = AuthServices.retrieveToken(
      user.id,
      'access_token',
      'refresh_token',
    );

    AuthServices.setTokens(res, { access_token, refresh_token });

    return {
      statusCode: StatusCodes.CREATED,
      message: `${user.role?.toCapitalize() ?? 'Unknown'} registered successfully!`,
      data: {
        access_token,
        refresh_token,
        user,
      },
    };
  }),

  edit: catchAsync(async req => {
    const data = await UserServices.updateUser(req);

    return {
      message: 'Profile updated successfully!',
      data,
    };
  }),

  updateLocation: catchAsync(async req => {
    await UserServices.updateUser(req);

    return {
      message: 'Location updated successfully!',
      data: req.body,
    };
  }),

  superEdit: catchAsync(async ({ params, body }) => {
    const user = (await prisma.user.findUnique({
      where: { id: params.userId },
    })) as TUser;

    const data = await UserServices.updateUser({
      user,
      body,
    });

    return {
      message: `${user?.role?.toCapitalize() ?? 'User'} updated successfully!`,
      data,
    };
  }),

  getAllUser: catchAsync(async ({ query }) => {
    const { meta, users } = await UserServices.getAllUser(query);

    return {
      message: 'Users retrieved successfully!',
      meta,
      data: users,
    };
  }),

  superGetAllUser: catchAsync(async ({ query }) => {
    const { meta, users } = await UserServices.getAllUser(query);

    Object.assign(meta, {
      users: await UserServices.getUsersCount(),
    });

    return {
      message: 'Users retrieved successfully!',
      meta,
      data: users,
    };
  }),

  profile: catchAsync(({ user }) => {
    Object.assign(user, {
      password: undefined,
      otp: undefined,
      otp_expires_at: undefined,
    } as Partial<TUser>);

    return {
      message: 'Profile retrieved successfully!',
      data: user,
    };
  }),

  delete: catchAsync(async ({ params }) => {
    const user = await UserServices.delete(params.userId);

    return {
      message: `${user?.name ?? 'User'} deleted successfully!`,
    };
  }),

  applyForDriver: catchAsync(async ({ body, user }) => {
    if (user.role === EUserRole.DRIVER)
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'You are already a driver',
      );

    const data = await UserServices.applyForDriver({
      user_id: user.id,
      ...body,
    });

    return {
      message: 'Application submitted successfully!',
      data,
    };
  }),
};
