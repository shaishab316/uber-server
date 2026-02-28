import config from '../../../config';
import { generateAuthHash } from '../../../utils/crypto/generateAuthHash';
import type {
  TInitiatePaymentPayload,
  TInitiatePaymentResult,
} from './Azul.interface';

export const payment_page_url =
  process.env.NODE_ENV === 'production'
    ? config.azul.urls.paymentPageProd
    : config.azul.urls.paymentPageTest;

export const payment_page_alt_url = config.azul.urls.paymentPageProdAlt;

export const AzulServices = {
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
      config.azul.redirectUrls.declined, //? DeclinedUrl
      config.azul.redirectUrls.cancel, //? CancelUrl
      '1', //? UseCustomField1 - "1" if label is provided, otherwise "0"
      payload.custom_field_1_label, //? CustomField1Label - the label for custom field 1, or empty string if not provided
      payload.custom_field_1_value, //? CustomField1Value - the value for custom field 1, or empty string if not provided
      '1', //? UseCustomField2 - "1" if label is provided, otherwise "0"
      payload.custom_field_2_label, //? CustomField2Label - the label for custom field 2, or empty string if not provided
      payload.custom_field_2_value, //? CustomField2Value - the value for custom field 2, or empty string if not provided
    ];

    const authHash = generateAuthHash(hashFields, config.azul.authKey);

    return {
      payment_page_url,
      payload: {
        MerchantId: config.azul.merchantId,
        MerchantName: config.azul.merchantName,
        MerchantType: config.azul.merchantType,
        CurrencyCode: config.azul.currencyCode,
        ApprovedUrl: config.azul.redirectUrls.approved,
        DeclinedUrl: config.azul.redirectUrls.declined,
        CancelUrl: config.azul.redirectUrls.cancel,

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
};
