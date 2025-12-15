import { prisma } from '../../../utils/db';
import { deleteFile } from '../../middlewares/capture';
import { TNewsCreate, TNewsEdit, TNewsGetAll } from './NewsFeed.interface';

export const NewsFeedServices = {
  async createNewsFeed(payload: TNewsCreate) {
    return prisma.newsFeed.create({
      data: payload,
    });
  },

  async editNewsFeed({ news_id, ...data }: TNewsEdit) {
    const newsFeed = await prisma.newsFeed.findUnique({
      where: { id: news_id },
      select: { image: true },
    });

    if (data.image && newsFeed?.image) {
      await deleteFile(newsFeed.image);
    }

    return prisma.newsFeed.update({
      where: { id: news_id },
      data,
    });
  },

  async deleteNewsFeed({ news_id }: { news_id: string }) {
    const newsFeed = await prisma.newsFeed.findUnique({
      where: { id: news_id },
      select: { image: true },
    });

    if (newsFeed?.image) {
      await deleteFile(newsFeed.image);
    }

    return prisma.newsFeed.delete({
      where: { id: news_id },
    });
  },

  async getAllNews({ limit, page, role, category }: TNewsGetAll) {
    const where = { role, category };

    const newsFeeds = await prisma.newsFeed.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { last_edited: 'desc' },
    });

    const total = await prisma.newsFeed.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      newsFeeds,
    };
  },

  async getNewsById(news_id: string) {
    return prisma.newsFeed.findUnique({
      where: { id: news_id },
    });
  },
};
