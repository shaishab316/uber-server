import { StatusCodes } from 'http-status-codes';
import { Prisma } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../util/db';
import { TPagination } from '../../../util/server/serveResponse';
import { deleteFile } from '../../middlewares/capture';
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

  async deleteMsg({ message_id, user_id }: TDeleteMsg) {
    const message = await prisma.message.findUnique({
      where: { id: message_id, OR: [{ user_id }, { driver_id: user_id }] },
    });

    if (!message)
      throw new ServerError(StatusCodes.NOT_FOUND, 'Message not found');

    //Cleanup
    if (message.media_url) deleteFile(message.media_url);

    return prisma.message.delete({ where: { id: message.id } });
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
