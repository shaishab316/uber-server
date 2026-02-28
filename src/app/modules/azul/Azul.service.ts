import { StatusCodes } from 'http-status-codes';
import config from '../../../config';
import ServerError from '../../../errors/ServerError';
import { generateAuthHash } from '../../../utils/crypto/generateAuthHash';
import type {
  TInitiatePaymentPayload,
  TInitiatePaymentResult,
  TVerifyPaymentPayload,
  TVerifyPaymentResult,
} from './Azul.interface';
import { debuglog as debug } from 'node:util';

/**
 * AzulServices provides methods to interact with the AZUL payment gateway, including initiating payments by generating the required payload and authentication hash for AZUL's hosted payment page, as well as verifying payments by validating the incoming query parameters from AZUL's redirect after payment processing.
 */
export const debugLog = debug('app:payment:azul');

export const azul_payment_page_url =
  process.env.NODE_ENV === 'production'
    ? config.azul.urls.paymentPageProd
    : config.azul.urls.paymentPageTest;

/**
 * AzulServices provides methods to interact with the AZUL payment gateway, including initiating payments by generating the required payload and authentication hash for AZUL's hosted payment page.
 */
export const AzulServices = {
  /**
   * Initiates a payment by generating the necessary payload and authentication hash for AZUL's hosted payment page.
   */
  initiatePayment(payload: TInitiatePaymentPayload): TInitiatePaymentResult {
    const hashFields: string[] = [
      config.azul.merchantId, //? MerchantId
      config.azul.merchantName, //? MerchantName
      config.azul.merchantType, //? MerchantType
      config.azul.currencyCode, //? CurrencyCode
      payload.order_number, //? OrderNumber
      payload.amount.toString(), //? Amount in AZUL integer format (cents, no decimal)
      '000', //? Itbis - AZUL doesn't support tax breakdown, so we send "000"
      config.azul.redirectUrls.approved, //? ApprovedUrl
      config.azul.redirectUrls.declined(payload.order_number), //? DeclinedUrl
      config.azul.redirectUrls.cancel(payload.order_number), //? CancelUrl
      '1', //? UseCustomField1 - "1" if label is provided, otherwise "0"
      payload.custom_field_1_label, //? CustomField1Label - the label for custom field 1, or empty string if not provided
      payload.custom_field_1_value, //? CustomField1Value - the value for custom field 1, or empty string if not provided
      '1', //? UseCustomField2 - "1" if label is provided, otherwise "0"
      payload.custom_field_2_label, //? CustomField2Label - the label for custom field 2, or empty string if not provided
      payload.custom_field_2_value, //? CustomField2Value - the value for custom field 2, or empty string if not provided
    ];

    const authHash = generateAuthHash(hashFields, config.azul.authKey);

    debugLog('Generated AZUL payment initiation payload with auth hash:', {
      payload,
      hashFields,
      authHash,
    });

    return {
      payment_page_url: azul_payment_page_url,
      payload: {
        MerchantId: config.azul.merchantId,
        MerchantName: config.azul.merchantName,
        MerchantType: config.azul.merchantType,
        CurrencyCode: config.azul.currencyCode,
        ApprovedUrl: config.azul.redirectUrls.approved,
        DeclinedUrl: config.azul.redirectUrls.declined(payload.order_number),
        CancelUrl: config.azul.redirectUrls.cancel(payload.order_number),

        OrderNumber: payload.order_number,
        Amount: payload.amount.toString(),
        Itbis: '000',
        UseCustomField1: '1',
        CustomField1Label: payload.custom_field_1_label,
        CustomField1Value: payload.custom_field_1_value,
        UseCustomField2: '1',
        CustomField2Label: payload.custom_field_2_label,
        CustomField2Value: payload.custom_field_2_value,
        ShowTransactionResult: '0',
        Local: 'EN',

        SaveToDataVault: '0',
        DesignV2: '1',
        LogoImageUrl: `${config.url.href}${config.server.logo}`,
        ProductImageUrl: payload.product_image_url,

        //? Important
        AuthHash: authHash,
      },
    };
  },

  /**
   * Verifies a payment by validating the incoming query parameters from AZUL's redirect after payment processing. It checks the authenticity of the data using the provided authentication hash and ensures that the transaction was successful based on the response code and ISO code.
   */
  verifyPayment(payload: TVerifyPaymentPayload): TVerifyPaymentResult {
    const hashFields: string[] = [
      payload.OrderNumber,
      payload.Amount.toString(),
      payload.AuthorizationCode,
      payload.DateTime,
      payload.ResponseCode,
      payload.IsoCode, //? IsoCode must be "00" for a successful transaction
      payload.ResponseMessage,
      payload.ErrorDescription,
      payload.RRN,
    ];

    const expectedAuthHash = generateAuthHash(hashFields, config.azul.authKey);
    const isValid =
      expectedAuthHash === payload.AuthHash && payload.IsoCode === '00';

    debugLog('Verifying AZUL payment response:', {
      payload,
      expectedAuthHash,
      isValid,
    });

    if (!isValid) {
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'Malformed Transaction Data',
      );
    }

    return {
      topup_id: payload.OrderNumber,

      //? if database amount don't match the payload amount, then need to update
      amount: payload.Amount,
    };
  },
};
