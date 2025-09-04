import { z } from 'zod';
import { UserValidations } from './User.validation';

export type TUserRegister = z.infer<typeof UserValidations.register>['body'];
export type TUserEdit = z.infer<typeof UserValidations.edit>['body'];
