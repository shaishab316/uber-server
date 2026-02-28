import config from '../../../config';
import {
  IAzulPaymentPagePayload,
  IAzulPaymentResponse,
  IDataVaultResult,
  IInitiatePaymentDTO,
  IInitiatePaymentResult,
  IVerifiedPaymentResult,
  TAzulTrxType,
} from './Azul.interface';
import { fromAzulAmount, generateAuthHash, toAzulAmount } from './Azul.utils';

class AzulServices {
  private cfg = config.azul;

  private static instance: AzulServices;

  private constructor() {}

  static getInstance(): AzulServices {
    return (AzulServices.instance ??= new AzulServices());
  }

  get paymentPageUrl(): string {
    return process.env.NODE_ENV === 'production'
      ? this.cfg.urls.paymentPageProd
      : this.cfg.urls.paymentPageTest;
  }

  get paymentPageAltUrl(): string {
    return this.cfg.urls.paymentPageProdAlt;
  }

  // ── Initiate Normal Sale / Hold / Post / Void ───────────────────────────────
  initiatePayment(dto: IInitiatePaymentDTO): IInitiatePaymentResult {
    const {
      orderNumber,
      amount,
      itbis = 0,
      trxType,
      azulOrderId = '',
      dataVaultToken = '',
      saveToDataVault = '0',
      customField1Label = '',
      customField1Value = '',
      customField2Label = '',
      customField2Value = '',
      locale = 'EN',
      useDesignV2 = '1',
      logoImageUrl,
      productImageUrl,
    } = dto;

    const formattedAmount = toAzulAmount(amount);
    const formattedITBIS = toAzulAmount(itbis);
    const useCustom1 = customField1Label ? '1' : '0';
    const useCustom2 = customField2Label ? '1' : '0';

    // ── Hash fields — exact order from AZUL docs ──────────────────────────
    const hashFields: string[] = [
      this.cfg.merchantId,
      this.cfg.merchantName,
      this.cfg.merchantType,
      this.cfg.currencyCode,
      orderNumber,
      formattedAmount,
      formattedITBIS,
      this.cfg.redirectUrls.approved,
      this.cfg.redirectUrls.declined,
      this.cfg.redirectUrls.cancel,
      useCustom1,
      customField1Label,
      customField1Value,
      useCustom2,
      customField2Label,
      customField2Value,
    ];

    // Hold / Post / Void add TrxType and optionally AZULOrderID to hash
    if (trxType) hashFields.push(trxType);
    if (azulOrderId) hashFields.push(azulOrderId);

    const authHash = generateAuthHash(hashFields, this.cfg.authKey);

    const payload: IAzulPaymentPagePayload = {
      MerchantId: this.cfg.merchantId,
      MerchantName: this.cfg.merchantName,
      MerchantType: this.cfg.merchantType,
      CurrencyCode: this.cfg.currencyCode,
      OrderNumber: orderNumber,
      Amount: formattedAmount,
      Itbis: formattedITBIS,
      ApprovedUrl: this.cfg.redirectUrls.approved,
      DeclinedUrl: this.cfg.redirectUrls.declined,
      CancelUrl: this.cfg.redirectUrls.cancel,
      UseCustomField1: useCustom1,
      CustomField1Label: customField1Label,
      CustomField1Value: customField1Value,
      UseCustomField2: useCustom2,
      CustomField2Label: customField2Label,
      CustomField2Value: customField2Value,
      ShowTransactionResult: '1',
      Local: locale,
      AuthHash: authHash,
      SaveToDataVault: saveToDataVault,
      DesignV2: useDesignV2,
    };

    // Optional fields
    if (trxType) payload.TrxType = trxType as TAzulTrxType;
    if (azulOrderId) payload.AZULOrderID = azulOrderId;
    if (dataVaultToken) payload.DataVaultToken = dataVaultToken;
    if (logoImageUrl) payload.LogoImageUrl = logoImageUrl;
    if (productImageUrl) payload.ProductImageUrl = productImageUrl;

    return { paymentPageUrl: this.paymentPageUrl, payload };
  }

  // ── Verify Response Hash from AZUL ──────────────────────────────────────────
  verifyPaymentResponse(
    response: IAzulPaymentResponse,
  ): IVerifiedPaymentResult {
    const {
      OrderNumber = '',
      Amount = '',
      AuthorizationCode = '',
      DateTime = '',
      ResponseCode = '',
      IsoCode = '',
      ResponseMessage = '',
      ErrorDescription = '',
      RRN = '',
      AuthHash,
      DataVaultToken,
      AZULOrderId,
    } = response;

    const responseFields = [
      OrderNumber,
      Amount,
      AuthorizationCode,
      DateTime,
      ResponseCode,
      IsoCode,
      ResponseMessage,
      ErrorDescription,
      RRN,
    ];

    const expectedHash = generateAuthHash(responseFields, this.cfg.authKey);
    const verified =
      expectedHash.toLowerCase() === (AuthHash ?? '').toLowerCase();

    console.log('AZUL Payment Verification:', {
      payload: response,
      responseFields,
      expectedHash,
      receivedHash: AuthHash,
      verified,
      serverAuthHashKey: this.cfg.authKey,
    });

    return {
      verified,
      approved: verified && IsoCode === '00',
      orderNumber: OrderNumber,
      amount: Amount,
      amountFormatted: fromAzulAmount(Amount),
      authorizationCode: AuthorizationCode,
      isoCode: IsoCode,
      responseMessage: ResponseMessage,
      errorDescription: ErrorDescription,
      dateTime: DateTime,
      rrn: RRN,
      dataVaultToken: DataVaultToken,
      azulOrderId: AZULOrderId,
    };
  }

  // ── DataVault Token Creation ─────────────────────────────────────────────────
  initiateDataVaultCreate(): IDataVaultResult {
    const useCustom1 = '0';
    const useCustom2 = '0';

    const hashFields: string[] = [
      this.cfg.merchantId,
      this.cfg.merchantName,
      this.cfg.merchantType,
      this.cfg.redirectUrls.approved,
      'CREATE',
      '', // DataVaultToken (empty = new token)
      this.cfg.redirectUrls.declined,
      this.cfg.redirectUrls.cancel,
      useCustom1,
      '',
      '',
      useCustom2,
      '',
      '',
    ];

    const authHash = generateAuthHash(hashFields, this.cfg.authKey);

    const payload = {
      MerchantId: this.cfg.merchantId,
      MerchantName: this.cfg.merchantName,
      MerchantType: this.cfg.merchantType,
      TrxType: 'CREATE',
      DataVaultToken: '',
      ApprovedUrl: this.cfg.redirectUrls.approved,
      DeclinedUrl: this.cfg.redirectUrls.declined,
      CancelUrl: this.cfg.redirectUrls.cancel,
      UseCustomField1: useCustom1,
      CustomField1Label: '',
      CustomField1Value: '',
      UseCustomField2: useCustom2,
      CustomField2Label: '',
      CustomField2Value: '',
      ShowTransactionResult: '1',
      AuthHash: authHash,
    };

    return {
      paymentPageUrl: `${this.paymentPageUrl}?Datavault=1`,
      payload,
    };
  }

  // ── DataVault Token Deletion ─────────────────────────────────────────────────
  initiateDataVaultDelete(token: string): IDataVaultResult {
    const useCustom1 = '0';
    const useCustom2 = '0';

    const hashFields: string[] = [
      this.cfg.merchantId,
      this.cfg.merchantName,
      this.cfg.merchantType,
      this.cfg.redirectUrls.approved,
      'DELETE',
      token,
      this.cfg.redirectUrls.declined,
      this.cfg.redirectUrls.cancel,
      useCustom1,
      '',
      '',
      useCustom2,
      '',
      '',
    ];

    const authHash = generateAuthHash(hashFields, this.cfg.authKey);

    const payload = {
      MerchantId: this.cfg.merchantId,
      MerchantName: this.cfg.merchantName,
      MerchantType: this.cfg.merchantType,
      TrxType: 'DELETE',
      DataVaultToken: token,
      ApprovedUrl: this.cfg.redirectUrls.approved,
      DeclinedUrl: this.cfg.redirectUrls.declined,
      CancelUrl: this.cfg.redirectUrls.cancel,
      UseCustomField1: useCustom1,
      CustomField1Label: '',
      CustomField1Value: '',
      UseCustomField2: useCustom2,
      CustomField2Label: '',
      CustomField2Value: '',
      ShowTransactionResult: '1',
      AuthHash: authHash,
    };

    return {
      paymentPageUrl: `${this.paymentPageUrl}?Datavault=1`,
      payload,
    };
  }
}

/**
 * Singleton instance of AzulServices. Use this to access the service methods throughout the app.
 */
export const azulServices = AzulServices.getInstance();
