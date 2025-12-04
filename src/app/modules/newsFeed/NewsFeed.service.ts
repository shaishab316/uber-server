import { prisma } from '../../../utils/db';
import { TList } from '../query/Query.interface';
import { TNewsCreate, TNewsEdit } from './NewsFeed.interface';

export const NewsFeedServices = {
  async createNewsFeed({ title, content, body, image }: TNewsCreate) {
    return prisma.newsFeed.create({
      data: {
        title,
        content,
        body,
        image,
      },
    });
  },

  async editNewsFeed({ news_id, ...data }: TNewsEdit) {
    return prisma.newsFeed.update({
      where: { id: news_id },
      data,
    });
  },

  async deleteNewsFeed({ news_id }: { news_id: string }) {
    return prisma.newsFeed.delete({
      where: { id: news_id },
    });
  },

  async getAllNews({ limit, page }: TList) {
    const newsFeeds = await prisma.newsFeed.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { last_edited: 'desc' },
    });

    const total = await prisma.newsFeed.count();

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
