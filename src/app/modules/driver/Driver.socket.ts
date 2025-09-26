import { TSocketHandler } from '../socket/Socket.interface';

const DriverSocket: TSocketHandler = (io, socket) => {
  console.log('Driver Socket');
};

export default DriverSocket;
