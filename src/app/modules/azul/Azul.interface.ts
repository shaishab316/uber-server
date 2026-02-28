import type { z } from 'zod';
import type { AzulValidation } from './Azul.validation';

/***************************************/
/********** Service Interface **********/
/***************************************/

export type TInitiatePaymentPayload = {
  order_number: string;
  amount: number;
  custom_field_1_label: string;
  custom_field_1_value: string;
  custom_field_2_label: string;
  custom_field_2_value: string;
  product_image_url: string;
};

export type TInitiatePaymentResult = {
  payment_page_url: string;
  payload: {
    MerchantId: string;
    MerchantName: string;
    MerchantType: string;
    CurrencyCode: string;
    ApprovedUrl: string;
    DeclinedUrl: string;
    CancelUrl: string;

    OrderNumber: string;
    Amount: string;
    Itbis: '000';
    UseCustomField1: '1';
    CustomField1Label: string;
    CustomField1Value: string;
    UseCustomField2: '1';
    CustomField2Label: string;
    CustomField2Value: string;
    ShowTransactionResult: '0';
    Local: 'EN';

    SaveToDataVault: '0';
    DesignV2: '1';
    LogoImageUrl: string;
    ProductImageUrl: string;

    //? Important
    AuthHash: string;
  };
};

/***************************************/
/********* Validation Interface ********/
/***************************************/

export type TVerifyPayment = z.infer<typeof AzulValidation.verifyPayment>;
export type TVerifyPaymentPayload = TVerifyPayment['query'];
export type TVerifyPaymentResult = {
  topup_id: string;
  amount: number;
};
