import { StatusCodes } from 'http-status-codes';
import * as OneSignal from 'onesignal-node';
import ServerError from '../../../errors/ServerError';
import config from '../../../config';

const client = new OneSignal.Client(
  config.onesignal.onesignal_app_id,
  config.onesignal.onesignal_api_key,
);

export const sendPushNotification = async (
  onesignal_ids: string[],
  message: string,
) => {
  try {
    const notification = {
      contents: { en: message },
      include_player_ids: onesignal_ids,
    };

    await client.createNotification(notification);
  } catch (error) {
    throw new ServerError(
      StatusCodes.FORBIDDEN,
      'Failed to send push notification',
    );
  }
};
