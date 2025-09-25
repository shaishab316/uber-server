import { TGetChat } from '../chat/Chat.interface';

export type TDeleteMsg = TGetChat & {
  message_id: string;
};

export type TSeenMsg = {
  message_id: string;
  who: 'driver' | 'user';
};
