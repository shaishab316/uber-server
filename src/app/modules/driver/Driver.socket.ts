import { TSocketHandler } from '../socket/Socket.interface';

const DriverSocket: TSocketHandler = (io, socket) => {
  console.log('Driver Socket', socket.data.user.id);
};

export default DriverSocket;
