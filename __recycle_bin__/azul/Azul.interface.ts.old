// src/modules/payment/azul.types.ts

// ─── Transaction Types ────────────────────────────────────────────────────────
export type TAzulTrxType = 'Hold' | 'Post' | 'Void' | 'CREATE' | 'DELETE';

// ─── Payment Initiation ───────────────────────────────────────────────────────
export interface IInitiatePaymentDTO {
  orderNumber: string;
  amount: number; // e.g. 150.00  →  server sends "15000"
  itbis?: number; // tax — 0 if exempt
  trxType?: TAzulTrxType;
  azulOrderId?: string; // required for Post / Void
  dataVaultToken?: string; // for paying with a saved card
  saveToDataVault?: '0' | '1';
  customField1Label?: string;
  customField1Value?: string;
  customField2Label?: string;
  customField2Value?: string;
  locale?: 'EN' | 'ES';
  useDesignV2?: '0' | '1';
  logoImageUrl?: string;
  productImageUrl?: string;
}

// ─── AZUL Payment Page POST fields ───────────────────────────────────────────
export interface IAzulPaymentPagePayload {
  MerchantId: string;
  MerchantName: string;
  MerchantType: string;
  CurrencyCode: string;
  OrderNumber: string;
  Amount: string;
  Itbis: string;
  ApprovedUrl: string;
  DeclinedUrl: string;
  CancelUrl: string;
  UseCustomField1: '0' | '1';
  CustomField1Label: string;
  CustomField1Value: string;
  UseCustomField2: '0' | '1';
  CustomField2Label: string;
  CustomField2Value: string;
  ShowTransactionResult: '0' | '1';
  Local: 'EN' | 'ES';
  AuthHash: string;
  SaveToDataVault: '0' | '1';
  DesignV2?: '0' | '1';
  TrxType?: TAzulTrxType;
  AZULOrderID?: string;
  DataVaultToken?: string;
  LogoImageUrl?: string;
  ProductImageUrl?: string;
}

// ─── Response from AZUL (querystring on redirect) ────────────────────────────
export interface IAzulPaymentResponse {
  OrderNumber: string;
  Amount: string;
  Itbis?: string;
  AuthorizationCode: string;
  DateTime: string;
  ResponseCode: string;
  IsoCode: string;
  ResponseMessage: string;
  ErrorDescription: string;
  RRN: string;
  AuthHash: string;
  AuthKey?: string;
  // DataVault fields (optional)
  DataVaultToken?: string;
  DataVaultExpiration?: string;
  DataVaultBrand?: string;
  AZULOrderId?: string;
  Discounted?: '0' | '1';
}

// ─── Verified result returned to your frontend ───────────────────────────────
export interface IVerifiedPaymentResult {
  verified: boolean;
  approved: boolean;
  orderNumber: string;
  amount: string; // still AZUL format e.g. "15000"
  amountFormatted: string; // human readable e.g. "150.00"
  authorizationCode: string;
  isoCode: string;
  responseMessage: string;
  errorDescription: string;
  dateTime: string;
  rrn: string;
  dataVaultToken?: string;
  azulOrderId?: string;
}

// ─── Service return types ─────────────────────────────────────────────────────
export interface IInitiatePaymentResult {
  paymentPageUrl: string;
  payload: IAzulPaymentPagePayload;
}

export interface IDataVaultResult {
  paymentPageUrl: string;
  payload: Record<string, string>;
}
