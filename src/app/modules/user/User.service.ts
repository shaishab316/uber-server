import { TList } from '../query/Query.interface';
import { userSearchableFields as searchFields } from './User.constant';
import { prisma } from '../../../utils/db';
import { EUserRole, Prisma, User as TUser } from '../../../../prisma';
import { TPagination } from '../../../utils/server/serveResponse';
import { deleteFile } from '../../middlewares/capture';
import { TApplyForDriver, TUserEdit, TUserRegister } from './User.interface';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { AuthServices } from '../auth/Auth.service';
import { errorLogger } from '../../../utils/logger/logger';
import { otpGenerator } from '../../../utils/crypto/otpGenerator';
import config from '../../../config';
import { otp_send_template } from '../../../templates';
import ms from 'ms';
import { sendEmail } from '../../../utils/sendMail';

export const userOmit = {
  location: true,
  password: true,
  otp: true,
  otp_expires_at: true,
};

export const UserServices = {
  async register({ password, name, email, phone }: TUserRegister) {
    AuthServices.validEmailORPhone({ email, phone });

    //! check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser)
      throw new ServerError(
        StatusCodes.CONFLICT,
        `User already exists with this ${email ? 'email' : ''} ${phone ? 'phone' : ''}`.trim(),
      );

    const otp = otpGenerator(config.otp.length);

    try {
      if (email)
        sendEmail({
          to: email,
          subject: `Your ${config.server.name} Account Verification OTP is ⚡ ${otp} ⚡.`,
          html: otp_send_template({
            userName: name,
            otp,
            template: 'account_verify',
          }),
        });
    } catch (error: any) {
      errorLogger.error(error.message);
    }

    //! finally create user and in return omit auth fields
    return prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: await password.hash(),
        role: EUserRole.USER,
        otp,
        otp_expires_at: new Date(Date.now() + ms(config.otp.exp)),
      },
      omit: userOmit,
    });
  },

  async updateUser({ user, body }: { user: Partial<TUser>; body: TUserEdit }) {
    if (body.phone || body.email) {
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email: body.email }, { phone: body.phone }] },
        select: { id: true, email: true, phone: true },
      });

      if (existingUser && existingUser.id !== user.id) {
        throw new ServerError(
          StatusCodes.CONFLICT,
          `User already exists with this ${existingUser.email ? 'email' : ''} ${existingUser.phone ? 'phone' : ''}`.trim(),
        );
      }
    }

    body.avatar ||= undefined;
    if (body.avatar && user?.avatar) await deleteFile(user.avatar);

    return prisma.user.update({
      where: { id: user.id },
      omit: userOmit,
      data: body,
    });
  },

  async getAllUser({
    page,
    limit,
    search,
    omit,
    ...where
  }: Prisma.UserWhereInput & TList & { omit: Prisma.UserOmit }) {
    where ??= {} as any;

    if (search)
      where.OR = searchFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));

    const users = await prisma.user.findMany({
      where,
      omit,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.user.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      users,
    };
  },

  async getUserById({
    userId,
    omit = undefined,
  }: {
    userId: string;
    omit?: Prisma.UserOmit;
  }) {
    return prisma.user.findUnique({
      where: { id: userId },
      omit,
    });
  },

  async getUsersCount() {
    const counts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        _all: true,
      },
    });

    return Object.fromEntries(
      counts.map(({ role, _count }) => [role, _count._all]),
    );
  },

  async deleteAccount(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.avatar) await deleteFile(user.avatar);

    return prisma.user.delete({ where: { id: userId } });
  },

  async applyForDriver({
    avatar,
    driver_license,
    business_contact,
    car_name,
    car_photo,
    nid_number,
    payment_method,
    user_id,
  }: TApplyForDriver & { user_id: string }) {
    return prisma.user.update({
      where: { id: user_id },
      data: {
        is_pending_driver: true,
        avatar,
        nid_number,
        payment_method,
        driver_info: {
          business_contact,
          car_name,
          car_photo,
          driver_license,
        },
      },
    });
  },
};
