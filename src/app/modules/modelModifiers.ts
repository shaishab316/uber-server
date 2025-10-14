import { User as TUser } from '../../../prisma';
import config from '../../config';

export const modelModifiers: Record<string, any> = {
  user: (u: TUser): TUser =>
    u.avatar ? { ...u, avatar: config.url.href + u.avatar } : u,
};
