import { userSearchableFields as searchFields } from './User.constant';
import { prisma } from '../../../utils/db';
import { EUserRole, Prisma, User as TUser } from '../../../../prisma';
import { TPagination } from '../../../utils/server/serveResponse';
import { deleteFile } from '../../middlewares/capture';
import type {
  TApplyForDriver,
  TApproveUser,
  TSuperGetAllUser,
  TUpdateOneSignalId,
  TUserEdit,
  TUserRegister,
} from './User.interface';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { AuthServices } from '../auth/Auth.service';
import { errorLogger } from '../../../utils/logger';
import { otpGenerator } from '../../../utils/crypto/otpGenerator';
import config from '../../../config';
import { emailTemplate } from '../../../templates';
import ms from 'ms';
import { sendEmail } from '../../../utils/sendMail';
import { hashPassword } from '../auth/Auth.utils';
import { ReferServices } from '../refer/Refer.service';

export const userOmit = {
  location: true,
  password: true,
  otp: true,
  otp_expires_at: true,
  fb_id: true,
  google_id: true,
  onesignal_id: true,
  available_loan: true,
  loan_taken: true,
  active_loan: true,
};

export const UserServices = {
  async register({ password, name, email, phone, refer_id }: TUserRegister) {
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
        await sendEmail({
          to: email,
          subject: `Your ${config.server.name} Account Verification OTP is ⚡ ${otp} ⚡.`,
          html: emailTemplate({
            userName: name,
            otp,
            template: 'account_verify',
          }),
        });
    } catch (error: any) {
      errorLogger.error(error.message);
    }

    //! finally create user and in return omit auth fields
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: await hashPassword(password),
        role: EUserRole.USER,
        otp,
        otp_expires_at: new Date(Date.now() + ms(config.otp.exp)),
        wallet: { create: {} },
      },
      omit: userOmit,
    });

    //? Handle reference bonus if refer_id is provided
    if (refer_id) {
      await ReferServices.handleReferenceBonus({
        user_id: user.id,
        refer_id,
      });
    }

    return {
      ...user,
      refer_id,
    };
  },

  async updateUser({
    user,
    body: { avatar, ...body },
  }: {
    user: Partial<TUser>;
    body: TUserEdit;
  }) {
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

    if (avatar && user?.avatar) await deleteFile(user.avatar);

    return prisma.user.update({
      where: { id: user.id },
      omit: userOmit,
      data: {
        ...body,
        ...(avatar ? { avatar } : {}),
      },
    });
  },

  async getAllUser({ page, limit, search, tab }: TSuperGetAllUser) {
    const where: Prisma.UserWhereInput = {};

    if (tab === 'drivers') {
      where.role = EUserRole.DRIVER;
      where.is_pending_driver = false;
    } else if (tab === 'pending_drivers') {
      where.is_pending_driver = true;
    } else {
      where.role = EUserRole.USER;
    }

    if (search)
      where.OR = searchFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));

    const users = await prisma.user.findMany({
      where,
      omit: userOmit,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.user.count({ where });

    const totalPendingDrivers = await prisma.user.count({
      where: { is_pending_driver: true },
    });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
        totalPendingDrivers,
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
    const validRoles = Object.values(EUserRole) as EUserRole[];

    const counts = await prisma.user.groupBy({
      by: ['role'],
      where: {
        role: {
          in: validRoles,
        },
      },
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
          car_name,
          car_photo,
          driver_license,
        },
      },
      omit: userOmit,
    });
  },

  async onesignalIdUpdate({ onesignal_id, user_id }: TUpdateOneSignalId) {
    await prisma.user.update({
      where: { id: user_id },
      data: {
        onesignal_id,
      },
    });
  },

  async approveUser({ user_id }: TApproveUser) {
    const user = (await prisma.user.findUnique({ where: { id: user_id } }))!;

    if (user.is_pending_driver) {
      return prisma.user.update({
        where: { id: user_id },
        data: {
          role: EUserRole.DRIVER,
          is_active: true,
          is_verified: true,
          is_pending_driver: false,
        },
        omit: userOmit,
      });
    }

    return prisma.user.update({
      where: { id: user_id },
      data: {
        is_verified: true,
        is_active: true,
      },
      omit: userOmit,
    });
  },

  async getProfile(user_id: string) {
    const user = await prisma.user.findUnique({
      where: { id: user_id },
      include: {
        wallet: {
          select: {
            balance: true,
          },
        },
      },
      omit: userOmit,
    });

    const refer_slug = await ReferServices.getReferSlug(user_id);

    return {
      ...user,
      refer_slug,
    };
  },
};
