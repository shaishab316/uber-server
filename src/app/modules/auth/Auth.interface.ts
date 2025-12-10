import z from 'zod';
import { AuthValidations } from './Auth.validation';
import { TReferredAble } from '../refer/Refer.interface';

export type TUserLogin = z.infer<typeof AuthValidations.login>['body'];
export type TAccountVerify = z.infer<
  typeof AuthValidations.accountVerify
>['body'];
export type TAccountVerifyOtpSend = z.infer<
  typeof AuthValidations.otpSend
>['body'];
export type TFacebookLogin = z.infer<
  typeof AuthValidations.facebookLogin
>['body'] &
  TReferredAble;
export type TGoogleLogin = z.infer<typeof AuthValidations.googleLogin>['body'] &
  TReferredAble;

export type TGoogleUser = {
  id: string;
  email?: string;
  verified_email?: boolean;
  picture?: string | null;
};

export type TFacebookUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  picture?: {
    data?: {
      url?: string | null;
    } | null;
  } | null;
};
