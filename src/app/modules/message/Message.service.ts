import { Prisma } from '../../../../prisma';
import { prisma } from '../../../util/db';
import { TPagination } from '../../../util/server/serveResponse';
import { TList } from '../query/Query.interface';
import { messageSearchableFields as searchableFields } from './Message.constant';
import { TDeleteMsg, TSeenMsg } from './Message.interface';

export const MessageServices = {
  async createMsg(messageData: Prisma.MessageCreateArgs['data']) {
    if (messageData.user_id) messageData.seen_by_user = true;
    else messageData.seen_by_driver = true;

    return prisma.message.create({
      data: messageData,
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
        driver: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });
  },

  async seenMsg({ message_id, who }: TSeenMsg) {
    return prisma.message.update({
      where: { id: message_id },
      data: { [`seen_by_${who}`]: true },
    });
  },

  async deleteMsg({ message_id, driver_id, user_id }: TDeleteMsg) {
    const message = await prisma.message.findUnique({
      where: { id: message_id },
      include: {
        driver: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (message?.driver_id !== driver_id && message?.user_id !== user_id) {
      throw new Error(
        `You cannot delete ${message?.user?.name ?? message?.driver?.name}'s message.`,
      );
    }

    return prisma.message.delete({ where: { id: message_id } });
  },

  async getChatMessages({
    chat_id,
    limit,
    page,
    search,
  }: TList & { chat_id: string }) {
    const where: Prisma.MessageWhereInput = {
      chat_id,
    };

    if (search) {
      where.OR = searchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const messages = await prisma.message.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    const total = await prisma.message.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      messages,
    };
  },
};
