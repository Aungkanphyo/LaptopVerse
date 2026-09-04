import { Request, Response } from "express";
import ContactSettings from "../models/contactSettings.model";
import { asyncHandler } from "../utils/asyncHandler";

export const getContactSettings = asyncHandler(async (req: Request, res: Response) => {
  let settings = await ContactSettings.findOne().lean();
  if (!settings) {
    settings = {
      email: "aungkanphyo1920095@gmail.com",
      phone: "+959798526456",
      address: "100 Tech Plaza, Silicon Hub, Yangon",
      workingHours: "Mon - Sat: 9:00 AM - 6:00 PM",
    } as any;
  }
  res.status(200).json({ success: true, settings });
});

export const updateContactSettingsAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { email, phone, address, workingHours } = req.body;
  let settings = await ContactSettings.findOne();

  if (settings) {
    settings.email = email;
    settings.phone = phone;
    settings.address = address;
    settings.workingHours = workingHours;
    settings.updatedBy = req.userId as any;
    await settings.save();
  } else {
    settings = await ContactSettings.create({
      email,
      phone,
      address,
      workingHours,
      updatedBy: req.userId,
    });
  }

  res.status(200).json({ success: true, message: "Contact settings updated successfully", settings });
});