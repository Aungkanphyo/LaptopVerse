import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import ManualPaymentSettings, {
  MANUAL_PAYMENT_SETTINGS_SINGLETON_KEY,
} from "../models/manualPaymentSettings.model";

function isMongoDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 11000
  );
}

const DEFAULT_INSTRUCTIONS =
  "Transfer the total amount to one of the accounts below. After transfer, place your order and include your transaction reference.";

/**
 * Exactly one ManualPaymentSettings document should exist — identified by singletonKey,
 * not by fake ObjectIds (those trigger Mongoose CastError → global handler returns HTTP 400).
 */
async function getOrCreateSettings() {
  let settings = await ManualPaymentSettings.findOne({
    singletonKey: MANUAL_PAYMENT_SETTINGS_SINGLETON_KEY,
  }).exec();

  if (!settings) {
    const legacyMissingKey = await ManualPaymentSettings.findOne({
      singletonKey: { $exists: false },
    }).exec();

    if (legacyMissingKey) {
      legacyMissingKey.set(
        "singletonKey",
        MANUAL_PAYMENT_SETTINGS_SINGLETON_KEY
      );
      await legacyMissingKey.save();
      settings = legacyMissingKey;
    }
  }

  if (settings) return settings;

  try {
    return await ManualPaymentSettings.create({
      singletonKey: MANUAL_PAYMENT_SETTINGS_SINGLETON_KEY,
      enabled: true,
      instructions: DEFAULT_INSTRUCTIONS,
      accounts: [],
    });
  } catch (err: unknown) {
    if (!isMongoDuplicateKeyError(err)) {
      throw err;
    }

    const existing = await ManualPaymentSettings.findOne({
      singletonKey: MANUAL_PAYMENT_SETTINGS_SINGLETON_KEY,
    }).exec();

    if (existing) {
      return existing;
    }

    throw err;
  }
}

/**
 * @desc Get public manual payment info (for checkout page)
 * @route GET /api/v1/payment/manual-info
 * @access Public
 */
export const getPublicManualPaymentInfo = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const settings = await getOrCreateSettings();

    res.status(200).json({
      success: true,
      enabled: settings.enabled,
      instructions: settings.instructions,
      accounts: settings.accounts
        .filter((a) => a.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder),
      updatedAt: settings.updatedAt,
    });
  }
);

/**
 * @desc Get manual payment settings (admin)
 * @route GET /api/v1/admin/manual-payment
 * @access Private (Admin)
 */
export const getManualPaymentSettingsAdmin = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const settings = await getOrCreateSettings();
    res.status(200).json({ success: true, settings });
  }
);

/**
 * @desc Update manual payment settings (admin)
 * @route PUT /api/v1/admin/manual-payment
 * @access Private (Admin)
 */
export const updateManualPaymentSettingsAdmin = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const settings = await getOrCreateSettings();

    settings.enabled = req.body.enabled;
    settings.instructions = req.body.instructions;
    settings.accounts = req.body.accounts;

    await settings.save();

    res.status(200).json({ success: true, settings });
  }
);

