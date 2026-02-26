import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import catchAsync from '../../middlewares/catchAsync';
import { azulServices } from './Azul.service';

export const AzulControllers = {
  initiatePayment: catchAsync(async ({ body }) => {
    const { orderNumber, amount } = body;

    if (!orderNumber || amount === undefined) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'orderNumber and amount are required',
      );
    }

    const result = azulServices.initiatePayment(body);

    return {
      message: 'Payment initiated successfully',
      data: result,
    };
  }),

  verifyPayment: catchAsync(async ({ body }) => {
    const result = azulServices.verifyPaymentResponse(body);

    if (!result.verified) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'AuthHash mismatch — possible response tampering detected',
      );
    }

    return {
      message: 'Payment response verified successfully',
      data: result,
    };
  }),

  createDataVaultToken: catchAsync(async () => {
    const result = azulServices.initiateDataVaultCreate();

    return {
      message: 'DataVault token creation initiated successfully',
      data: result,
    };
  }),

  deleteDataVaultToken: catchAsync(async ({ body }) => {
    const { token } = body;

    if (!token) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'token is required to delete DataVault entry',
      );
    }

    const result = azulServices.initiateDataVaultDelete(token);

    return {
      message: 'DataVault token deletion initiated successfully',
      data: result,
    };
  }),
};
