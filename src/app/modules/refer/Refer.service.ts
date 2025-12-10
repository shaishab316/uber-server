import { ETransactionType, Prisma } from '../../../../prisma';
import { prisma } from '../../../utils/db';
import { TPagination } from '../../../utils/server/serveResponse';
import { TList } from '../query/Query.interface';
import { userSearchableFields } from '../user/User.constant';
import { userOmit } from '../user/User.service';
import { THandleReferenceBonusArgs } from './Refer.interface';

export const ReferServices = {
  async getReferSlug(user_id: string) {
    let refer = await prisma.refer.findFirst({
      where: { user_id },
    });

    if (!refer) {
      const lastRefer = await prisma.refer.findFirst({
        orderBy: { slug: 'desc' },
      });

      refer = await prisma.refer.create({
        data: {
          user_id,
          slug: lastRefer ? lastRefer.slug + 1 : 1,
        },
      });
    }

    return refer.slug;
  },

  async getReferredUsers({
    limit,
    page,
    user_id,
    search,
  }: TList & { user_id: string }) {
    const where: Prisma.UserWhereInput = {
      refer: {
        user_id,
      },
    };

    if (search) {
      where.OR = userSearchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const referredUsers = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      omit: userOmit,
    });

    const total = await prisma.user.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
      referredUsers,
    };
  },

  async handleReferenceBonus({ user_id, refer_id }: THandleReferenceBonusArgs) {
    const bonusAmount = 20; //TODO: move to config

    await prisma.$transaction(async prismaTx => {
      const referer = await prismaTx.user.findFirst({
        where: {
          refer: {
            slug: refer_id,
          },
        },
      });

      if (!referer) {
        return; //? Invalid refer id
      }

      const referred_user = await prismaTx.user.findUnique({
        where: { id: user_id },
        select: { refer_id: true },
      });

      if (referred_user?.refer_id) {
        return; //? User was already referred, do not give bonus again
      }

      //? Set referer id to new user
      await prismaTx.user.update({
        where: { id: user_id },
        data: { refer_id: referer.id },
      });

      //? Add bonus to referer
      await prismaTx.wallet.update({
        where: { user_id: referer.id },
        data: {
          balance: {
            increment: bonusAmount,
          },
        },
      });

      //? Add bonus to new user
      await prismaTx.wallet.update({
        where: { user_id },
        data: {
          balance: {
            increment: bonusAmount,
          },
        },
      });

      //? Log transactions
      await prismaTx.transaction.createMany({
        data: [user_id, referer.id].map(user_id => ({
          user_id,
          amount: bonusAmount,
          type: ETransactionType.EARNED,
          description: `Referral bonus for referring a new user.`,
          payment_method: 'REFERRAL',
        })),
      });
    });
  },
};
