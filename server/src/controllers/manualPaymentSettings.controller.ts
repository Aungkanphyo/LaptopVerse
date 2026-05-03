import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import ManualPaymentSettings from "../models/manualPaymentSettings.model";

const DEFAULT_DOC_ID = "global-manual-payment-settings";

async function getOrCreateSettings() {
  const existing = await ManualPaymentSettings.findById(DEFAULT_DOC_ID);
  if (existing) return existing;

  return ManualPaymentSettings.create({
    _id: DEFAULT_DOC_ID,
    enabled: true,
    instructions:
      "Transfer the total amount to one of the accounts below. After transfer, place your order and include your transaction reference.",
    accounts: [],
  });
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
    // console.log(settings);
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

