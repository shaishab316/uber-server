import { UserServices } from './User.service';
import catchAsync from '../../middlewares/catchAsync';
import { StatusCodes } from 'http-status-codes';
import { AuthServices } from '../auth/Auth.service';
import { User as TUser } from '../../../../prisma';
import { prisma } from '../../../utils/db';
import { enum_decode } from '../../../utils/transform/enum';
import { capitalize } from '../../../utils/transform/capitalize';

export const UserControllers = {
  register: catchAsync(async ({ body, query }, res) => {
    const user = await UserServices.register({
      ...body,
      ...query,
    });

    const { access_token, refresh_token } = AuthServices.retrieveToken(
      user.id,
      'access_token',
      'refresh_token',
    );

    AuthServices.setTokens(res, { access_token, refresh_token });

    return {
      track_activity: user.id,
      statusCode: StatusCodes.CREATED,
      message: `${capitalize(user.role) ?? 'Unknown'} registered successfully!`,
      data: {
        access_token,
        refresh_token,
        user,
      },
    };
  }),

  editProfile: catchAsync(async req => {
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

  superEditProfile: catchAsync(async ({ params, body }) => {
    const user = (await prisma.user.findUnique({
      where: { id: params.userId },
    })) as TUser;

    const data = await UserServices.updateUser({
      user,
      body,
    });

    return {
      message: `${capitalize(user?.role) ?? 'User'} updated successfully!`,
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

    return {
      message: 'Users retrieved successfully!',
      meta,
      data: users,
    };
  }),

  profile: catchAsync(async ({ user }) => {
    const data = await UserServices.getProfile(user.id);

    return {
      message: 'Profile retrieved successfully!',
      data,
    };
  }),

  superDeleteAccount: catchAsync(async ({ params }) => {
    const user = await UserServices.deleteAccount(params.userId);

    return {
      message: `${user?.name ?? 'User'} deleted successfully!`,
    };
  }),

  deleteAccount: catchAsync(async ({ user }) => {
    await UserServices.deleteAccount(user.id);

    return {
      message: `Goodbye ${user?.name ?? enum_decode(user.role)}! Your account has been deleted successfully!`,
    };
  }),

  applyForDriver: catchAsync(async ({ body, user }) => {
    const data = await UserServices.applyForDriver({
      user_id: user.id,
      ...body,
    });

    return {
      message: 'Application submitted successfully!',
      data,
    };
  }),

  onesignalIdUpdate: catchAsync(async ({ body, user }) => {
    await UserServices.onesignalIdUpdate({
      ...body,
      user_id: user.id,
    });

    return {
      message: 'OneSignal ID updated successfully!',
    };
  }),

  approveUser: catchAsync(async ({ body }) => {
    const data = await UserServices.approveUser(body);

    return {
      message: 'User approved successfully!',
      data,
    };
  }),
};
