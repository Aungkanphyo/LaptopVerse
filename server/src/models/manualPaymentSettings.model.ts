import mongoose, { Document, Model, Schema } from "mongoose";

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

export interface IManualPaymentSettingsDocument extends Document {
  enabled: boolean;
  instructions: string;
  accounts: IManualPaymentAccount[];
  updatedAt: Date;
  createdAt: Date;
}

const manualPaymentAccountSchema = new Schema<IManualPaymentAccount>(
  {
    provider: {
      type: String,
      required: true,
      enum: ["KPay", "AYA Pay", "Wave Money", "UAB Pay", "CB Pay", "Other"],
      trim: true,
    },
    accountName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    phoneNumber: { type: String, trim: true },
    note: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const manualPaymentSettingsSchema = new Schema<IManualPaymentSettingsDocument>(
  {
    enabled: { type: Boolean, default: true },
    instructions: {
      type: String,
      default:
        "Transfer the total amount to one of the accounts below. After transfer, place your order and include your transaction reference.",
      trim: true,
      maxlength: 2000,
    },
    accounts: { type: [manualPaymentAccountSchema], default: [] },
  },
  { timestamps: true }
);

const ManualPaymentSettings: Model<IManualPaymentSettingsDocument> =
  mongoose.models.ManualPaymentSettings ||
  mongoose.model<IManualPaymentSettingsDocument>(
    "ManualPaymentSettings",
    manualPaymentSettingsSchema
  );

export default ManualPaymentSettings;

