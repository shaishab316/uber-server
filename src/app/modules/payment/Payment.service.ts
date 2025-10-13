import { StatusCodes } from 'http-status-codes';
import config from '../../../config';
import ServerError from '../../../errors/ServerError';
import { stripe } from './Payment.utils';
import { TTopup } from './Payment.interface';
import { prisma } from '../../../utils/db';
import { ETransactionType } from '../../../../prisma';
import { SocketServices } from '../socket/Socket.service';
import { socketResponse } from '../socket/Socket.utils';

export const PaymentServices = {
  async topup({ amount, user_id }: TTopup) {
    const { url } = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: config.payment.currency,
            product_data: {
              name: `${config.server.name} Wallet Top-up of $${amount}`,
              description: 'Add funds to your wallet balance.',
              metadata: {
                type: 'wallet_topup',
              },
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      payment_method_types: config.payment.stripe.methods,
      success_url: `${config.server.name.toLowerCase()}://topup-success?amount=${amount}`,
      cancel_url: `${config.server.name.toLowerCase()}://topup-failure?amount=${amount}`,
      metadata: {
        purpose: 'wallet_topup',
        amount: amount.toString(),
        user_id,
      },
    });

    if (!url)
      throw new ServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to create checkout session',
      );

    return url;
  },

  async pay({ trip_id, user_id }: { trip_id: string; user_id: string }) {
    const trip = (await prisma.trip.findUnique({
      where: {
        id: trip_id,
      },
    }))!;

    // if (trip.transaction_id)
    //   throw new ServerError(StatusCodes.CONFLICT, 'Trip already paid');

    const wallet = (await prisma.wallet.findFirst({
      where: {
        user_id,
      },
    }))!;

    if (trip.total_cost > wallet.balance)
      throw new ServerError(StatusCodes.CONFLICT, 'Insufficient balance');

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: wallet.balance - trip.total_cost },
    });

    const transaction = await prisma.transaction.create({
      data: {
        amount: trip.total_cost,
        payment_method: 'wallet',
        type: ETransactionType.EXPENSE,
        user_id,
      },
    });

    const updatedTrip = await prisma.trip.update({
      where: { id: trip_id },
      data: { transaction_id: transaction.id, payed_at: new Date() },
    });

    SocketServices.getIO('/trip')
      ?.to(trip.driver_id!)
      .emit(
        'trip_paid',
        socketResponse({
          message: 'Trip paid successfully',
          meta: { trip_id },
          data: updatedTrip,
        }),
      );
  },
};
