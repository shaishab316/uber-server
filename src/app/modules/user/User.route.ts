import { Router } from 'express';
import { UserControllers } from './User.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { UserValidations } from './User.validation';
import capture from '../../middlewares/capture';
import auth from '../../middlewares/auth';
import { AuthControllers } from '../auth/Auth.controller';

const avatarCapture = capture({
  avatar: {
    size: 5 * 1024 * 1024,
    maxCount: 1,
    fileType: 'images',
  },
});

const admin = Router();
{
  admin.get(
    '/',
    purifyRequest(QueryValidations.list, UserValidations.getAllUser),
    UserControllers.superGetAllUser,
  );

  admin.patch(
    ':userId/edit',
    avatarCapture,
    purifyRequest(UserValidations.edit),
    UserControllers.superEdit,
  );

  admin.delete(
    '/:userId/delete',
    purifyRequest(QueryValidations.exists('userId', 'user')),
    UserControllers.delete,
  );
}

const user = Router();
{
  user.get('/', auth(), UserControllers.profile);

  user.patch(
    '/edit',
    auth(),
    capture({
      avatar: {
        size: 5 * 1024 * 1024,
        maxCount: 1,
        fileType: 'images',
      },
      car_photo: {
        size: 20 * 1024 * 1024,
        maxCount: 1,
        fileType: 'images',
      },
    }),
    purifyRequest(UserValidations.edit),
    UserControllers.edit,
  );

  user.post(
    '/change-password',
    auth(),
    purifyRequest(UserValidations.changePassword),
    AuthControllers.changePassword,
  );
}

export const UserRoutes = {
  admin,
  user,
};
