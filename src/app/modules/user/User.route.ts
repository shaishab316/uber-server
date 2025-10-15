import { Router } from 'express';
import { UserControllers } from './User.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { UserValidations } from './User.validation';
import capture from '../../middlewares/capture';
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
    purifyRequest(
      QueryValidations.exists('userId', 'user'),
      UserValidations.edit,
    ),
    UserControllers.superEditProfile,
  );

  admin.delete(
    '/:userId/delete',
    purifyRequest(QueryValidations.exists('userId', 'user')),
    UserControllers.superDeleteAccount,
  );
}

const user = Router();
{
  user.get('/', UserControllers.profile);

  user.patch(
    '/edit',
    avatarCapture,
    purifyRequest(UserValidations.edit),
    UserControllers.editProfile,
  );

  user.delete('/delete', UserControllers.deleteAccount);

  user.post(
    '/change-password',
    purifyRequest(UserValidations.changePassword),
    AuthControllers.changePassword,
  );

  user.post(
    '/apply-for-driver',
    capture({
      avatar: {
        size: 5 * 1024 * 1024,
        maxCount: 1,
        fileType: 'images',
      },
      driver_license: {
        size: 100 * 1024 * 1024,
        maxCount: 1,
        fileType: 'images',
      },
      car_photo: {
        size: 100 * 1024 * 1024,
        maxCount: 1,
        fileType: 'images',
      },
    }),
    purifyRequest(UserValidations.applyForDriver),
    UserControllers.applyForDriver,
  );

  user.post(
    '/update-location',
    purifyRequest(UserValidations.updateLocation),
    UserControllers.updateLocation,
  );
}

export const UserRoutes = {
  admin,
  user,
};
