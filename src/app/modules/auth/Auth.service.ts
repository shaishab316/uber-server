/* eslint-disable no-unused-vars */
import { $ZodIssue } from 'zod/v4/core/errors.cjs';
import { User as TUser } from '../../../../prisma';
import {
  TAccountVerify,
  TAccountVerifyOtpSend,
  TUserLogin,
} from './Auth.interface';
import {
  encodeToken,
  hashPassword,
  TToken,
  verifyPassword,
} from './Auth.utils';
import { ZodError } from 'zod';
import { prisma } from '../../../utils/db';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { otpGenerator } from '../../../utils/crypto/otpGenerator';
import config from '../../../config';
import { sendEmail } from '../../../utils/sendMail';
import { otp_send_template } from '../../../templates';
import { errorLogger } from '../../../utils/logger';
import ms from 'ms';
import { userOmit } from '../user/User.service';
import { Response } from 'express';

export const AuthServices = {
  async login({ password, email, phone }: TUserLogin): Promise<Partial<TUser>> {
    this.validEmailORPhone({ email, phone });

    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
      omit: {
        otp: true,
        otp_expires_at: true,
        location: true,
      },
    });

    if (!user)
      throw new ServerError(StatusCodes.NOT_FOUND, "User doesn't exist");

    if (!(await verifyPassword(password, user.password))) {
      throw new ServerError(StatusCodes.UNAUTHORIZED, 'Incorrect password');
    }

    if (!user.is_verified) {
      const otp = otpGenerator(config.otp.length);

      try {
        if (email)
          sendEmail({
            to: email,
            subject: `Your ${config.server.name} Account Verification OTP is ⚡ ${otp} ⚡.`,
            html: otp_send_template({
              userName: user.name,
              otp,
              template: 'account_verify',
            }),
          });
      } catch (error: any) {
        errorLogger.error(error.message);
      }

      const { otp_expires_at } = await prisma.user.update({
        where: { id: user.id },
        data: {
          otp,
          otp_expires_at: new Date(Date.now() + ms(config.otp.exp)),
        },
        select: {
          otp_expires_at: true,
        },
      });

      Object.assign(user, { otp_expires_at });
    }

    Object.assign(user, { password: undefined });

    return user;
  },

  validEmailORPhone({ email, phone }: { email?: string; phone?: string }) {
    if (!email || !phone) {
      const issues: $ZodIssue[] = [];

      if (!email && !phone)
        issues.push({
          code: 'custom',
          path: ['email'],
          message: 'Email or phone is missing',
        });

      if (!phone && !email)
        issues.push({
          code: 'custom',
          path: ['phone'],
          message: 'Email or phone is missing',
        });

      if (issues.length) throw new ZodError(issues);
    }
  },

  setTokens(res: Response, tokens: { [key in TToken]?: string }) {
    Object.entries(tokens).forEach(([key, value]) =>
      res.cookie(key, value, {
        httpOnly: true,
        secure: !config.server.isDevelopment,
        maxAge: ms(config.jwt[key as TToken].expire_in),
      }),
    );
  },

  destroyTokens<T extends readonly TToken[]>(res: Response, ...cookies: T) {
    for (const cookie of cookies)
      res.clearCookie(cookie, {
        httpOnly: true,
        secure: !config.server.isDevelopment,
        maxAge: 0, // expire immediately
      });
  },

  /** this function returns an object of tokens
   * e.g. retrieveToken(userId, 'access_token', 'refresh_token');
   * returns { access_token, refresh_token }
   */
  retrieveToken<T extends readonly TToken[]>(uid: string, ...token_types: T) {
    return Object.fromEntries(
      token_types.map(token_type => [
        token_type,
        encodeToken({ uid }, token_type),
      ]),
    ) as Record<T[number], string>;
  },

  async accountVerifyOtpSend({ email, phone }: TAccountVerifyOtpSend) {
    this.validEmailORPhone({ email, phone });

    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (!user)
      throw new ServerError(StatusCodes.NOT_FOUND, "User doesn't exist");

    if (user.is_verified)
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'Your account is already verified',
      );

    const otp = otpGenerator(config.otp.length);

    try {
      if (email)
        sendEmail({
          to: email,
          subject: `Your ${config.server.name} Account Verification OTP is ⚡ ${otp} ⚡.`,
          html: otp_send_template({
            userName: user.name,
            otp,
            template: 'account_verify',
          }),
        });
    } catch (error: any) {
      errorLogger.error(error.message);
    }

    return prisma.user.update({
      where: { id: user.id },
      data: {
        otp,
        otp_expires_at: new Date(Date.now() + ms(config.otp.exp)),
      },
      select: {
        otp_expires_at: true,
      },
    });
  },

  async forgotPassword({ email, phone }: TAccountVerifyOtpSend) {
    this.validEmailORPhone({ email, phone });

    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (!user)
      throw new ServerError(StatusCodes.NOT_FOUND, "User doesn't exist");

    const otp = otpGenerator(config.otp.length);

    try {
      if (email)
        sendEmail({
          to: email,
          subject: `Your ${config.server.name} Password Reset OTP is ⚡ ${otp} ⚡.`,
          html: otp_send_template({
            userName: user.name,
            otp,
            template: 'reset_password',
          }),
        });
    } catch (error: any) {
      errorLogger.error(error.message);
    }

    return prisma.user.update({
      where: { id: user.id },
      data: {
        otp,
        otp_expires_at: new Date(Date.now() + ms(config.otp.exp)),
      },
      select: {
        otp_expires_at: true,
      },
    });
  },

  async accountVerify({ email, phone, otp }: TAccountVerify) {
    this.validEmailORPhone({ email, phone });

    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (!user)
      throw new ServerError(StatusCodes.NOT_FOUND, "User doesn't exist");

    if (user.otp !== otp)
      throw new ServerError(StatusCodes.UNAUTHORIZED, 'Incorrect OTP');

    if (!user.otp_expires_at || user.otp_expires_at < new Date())
      throw new ServerError(StatusCodes.UNAUTHORIZED, 'OTP has expired');

    return prisma.user.update({
      where: { id: user.id },
      data: {
        is_verified: true,
        otp: null,
        otp_expires_at: null,
      },
      omit: userOmit,
    });
  },

  async modifyPassword({
    userId,
    password,
  }: {
    userId: string;
    password: string;
  }) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: await hashPassword(password) },
      select: {
        id: true,
      },
    });
  },
};
