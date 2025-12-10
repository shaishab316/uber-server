import { z } from 'zod';
import { UserValidations } from './User.validation';
import { TList } from '../query/Query.interface';
import { TReferredAble } from '../refer/Refer.interface';

export type TUserRegister = z.infer<typeof UserValidations.register>['body'] &
  TReferredAble;
export type TUserEdit = z.infer<typeof UserValidations.edit>['body'];
export type TApplyForDriver = z.infer<
  typeof UserValidations.applyForDriver
>['body'];

export type TUpdateOneSignalId = z.infer<
  typeof UserValidations.onesignalId
>['body'] & { user_id: string };

export type TSuperGetAllUser = z.infer<
  typeof UserValidations.getAllUser
>['query'] &
  TList;

export type TApproveUser = z.infer<typeof UserValidations.approveUser>['body'];
