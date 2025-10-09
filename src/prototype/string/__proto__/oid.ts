import { ObjectId } from 'mongodb';
import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';

declare global {
  interface String {
    readonly oid: ObjectId;
  }
}

Object.defineProperty(String.prototype, 'oid', {
  get() {
    if (!this.trim()) return;

    if (!ObjectId.isValid(this as string))
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        this + ' is an invalid ObjectId',
      );

    return new ObjectId(this as string);
  },
  enumerable: false,
});

const oid = (str: string) => new ObjectId(str);

export { oid };
