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

    const msg = await prisma.message.create({
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

    // update chat last msg
    await prisma.chat.update({
      where: { id: messageData.chat_id },
      data: { last_message_id: msg.id },
    });

    return msg;
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
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        'You are not allowed to delete this message',
      );

    //Cleanup
    if (message.media_url) await deleteFile(message.media_url);

    const msg = await prisma.message.delete({
      where: { id: message.id },
    });

    const lastMsg = await prisma.message.findFirst({
      where: { chat_id: message.chat_id },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
      },
    });

    // update chat last msg
    await prisma.chat.update({
      where: { id: message.chat_id },
      data: { last_message_id: lastMsg?.id },
    });

    return msg;
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
