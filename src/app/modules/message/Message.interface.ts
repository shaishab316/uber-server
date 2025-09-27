export type TDeleteMsg = {
  message_id: string;
  user_id: string;
};

export type TSeenMsg = {
  message_id: string;
  who: 'driver' | 'user';
};
