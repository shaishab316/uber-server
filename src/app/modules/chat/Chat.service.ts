import { StatusCodes } from 'http-status-codes';
import { Prisma } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../util/db';
import { TList } from '../query/Query.interface';
import { messageSearchableFields as searchableFields } from '../message/Message.constant';
import { TPagination } from '../../../util/server/serveResponse';
import { TGetChat } from './Chat.interface';

export const ChatServices = {
  async getChat({ driver_id, user_id }: Required<TGetChat>) {
    return (
      (await prisma.chat.findFirst({
        where: {
          user_id,
          driver_id,
        },
      })) ??
      (await prisma.chat.create({
        data: {
          driver_id,
          user_id,
        },
      }))
    );
  },

  async getInboxChats({
    page,
    limit,
    search,
    driver_id,
    user_id,
  }: TGetChat & TList) {
    const where: Prisma.ChatWhereInput = {};
    const include: Prisma.ChatInclude = {
      last_message: true,
    };

    if (driver_id) {
      where.driver_id = driver_id;

      include.user = {
        select: {
          name: true,
          avatar: true,
        },
      };
    }

    if (user_id) {
      where.user_id = user_id;

      include.driver = {
        select: {
          name: true,
          avatar: true,
        },
      };
    }

    if (search)
      where.OR = searchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));

    const chats = await prisma.chat.findMany({
      where,
      include,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.chat.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      chats,
    };
  },

  async deleteChat({
    chatId,
    driver_id,
    user_id,
  }: TGetChat & { chatId: string }) {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
      },
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

    if (chat?.driver_id !== driver_id && chat?.user_id !== user_id) {
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `Only user ${chat?.user?.name} or driver ${chat?.driver?.name} can delete this chat`,
      );
    }

    return prisma.chat.delete({ where: { id: chatId } });
  },
};
