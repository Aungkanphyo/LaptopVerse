export type ManualPaymentProvider =
  | "KPay"
  | "AYA Pay"
  | "Wave Money"
  | "UAB Pay"
  | "CB Pay"
  | "Other";

export interface IManualPaymentAccount {
  provider: ManualPaymentProvider;
  accountName: string;
  accountNumber: string;
  phoneNumber?: string;
  note?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface IPublicManualPaymentInfoResponse {
  success: boolean;
  enabled: boolean;
  instructions: string;
  accounts: IManualPaymentAccount[];
  updatedAt: string;
}

export interface IManualPaymentSettings {
  _id: string;
  enabled: boolean;
  instructions: string;
  accounts: IManualPaymentAccount[];
  createdAt: string;
  updatedAt: string;
}

export interface IAdminManualPaymentSettingsResponse {
  success: boolean;
  settings: IManualPaymentSettings;
}

