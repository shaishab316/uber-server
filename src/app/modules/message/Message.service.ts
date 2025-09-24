
export const MessageServices = {
  async create(messageData: TMessage) {
    return Message.create(messageData);
  },
};
