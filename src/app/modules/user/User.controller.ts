import { UserServices } from './User.service';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { StatusCodes } from 'http-status-codes';
import { AuthServices } from '../auth/Auth.service';
import { EUserRole, User as TUser } from '../../../../prisma';
import { prisma } from '../../../util/db';
import ServerError from '../../../errors/ServerError';

export const UserControllers = {
  register: catchAsync(async ({ body }, res) => {
    const user = await UserServices.create(body);

    const { access_token, refresh_token } = AuthServices.retrieveToken(
      user.id,
      'access_token',
      'refresh_token',
    );

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: `${user.role?.toCapitalize() ?? 'Unknown'} registered successfully!`,
      data: {
        access_token,
        refresh_token,
        user,
      },
    });
  }),

  edit: catchAsync(async (req, res) => {
    const data = await UserServices.updateUser(req);

    serveResponse(res, {
      message: 'Profile updated successfully!',
      data,
    });
  }),

  updateLocation: catchAsync(async (req, res) => {
    await UserServices.updateUser(req);

    serveResponse(res, {
      message: 'Location updated successfully!',
      data: req.body,
    });
  }),

  superEdit: catchAsync(async ({ params, body }, res) => {
    const user = (await prisma.user.findUnique({
      where: { id: params.userId },
    })) as TUser;

    const data = await UserServices.updateUser({
      user,
      body,
    });

    serveResponse(res, {
      message: `${user?.role?.toCapitalize() ?? 'User'} updated successfully!`,
      data,
    });
  }),

  getAllUser: catchAsync(async ({ query }, res) => {
    const { meta, users } = await UserServices.getAllUser(query);

    serveResponse(res, {
      message: 'Users retrieved successfully!',
      meta,
      data: users,
    });
  }),

  superGetAllUser: catchAsync(async ({ query }, res) => {
    const { meta, users } = await UserServices.getAllUser(query);

    Object.assign(meta, {
      users: await UserServices.getUsersCount(),
    });

    serveResponse(res, {
      message: 'Users retrieved successfully!',
      meta,
      data: users,
    });
  }),

  profile: catchAsync(({ user }, res) => {
    Object.assign(user, {
      password: undefined,
      otp: undefined,
      otp_expires_at: undefined,
    } as Partial<TUser>);

    serveResponse(res, {
      message: 'Profile retrieved successfully!',
      data: user,
    });
  }),

  delete: catchAsync(async ({ params }, res) => {
    const user = await UserServices.delete(params.userId);

    serveResponse(res, {
      message: `${user?.name ?? 'User'} deleted successfully!`,
    });
  }),

  applyForDriver: catchAsync(async ({ body, user }, res) => {
    if (user.role === EUserRole.DRIVER)
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'You are already a driver',
      );

    const data = await UserServices.applyForDriver({
      user_id: user.id,
      ...body,
    });

    serveResponse(res, {
      message: 'Application submitted successfully!',
      data,
    });
  }),
};
