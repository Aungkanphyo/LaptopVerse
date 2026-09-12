import { Request, Response } from 'express';
import { Inquiry } from '../models/inquiry.model';
import { AppError } from '../utils/error.utils';
import { InquiryStatus } from '../types/inquiry.types';
import { asyncHandler } from '../utils/asyncHandler';
import sendEmail from '../utils/sendEmail';

// @desc    Submit a new contact inquiry (Public)
// @route   POST /api/v1/inquiries
export const createInquiry = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    throw new AppError('Please provide name, email, and message', 400);
  }

  const inquiry = await Inquiry.create({
    name,
    email,
    message,
  });

  res.status(201).json({
    success: true,
    message: 'Send message successfully. We will get back to you soon.',
    data: inquiry,
  });
});

// @desc    Get paginated inquiries with status filter and search (Admin)
// @route   GET /api/v1/inquiries
export const getInquiries = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
  const skip = (page - 1) * limit;

  const { status, search } = req.query;

  const filter: Record<string, any> = {};

  if (status && status !== 'all' && ['pending', 'read', 'replied'].includes(status as string)) {
    filter.status = status;
  }

  if (search) {
    const searchRegex = new RegExp(String(search).trim(), 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }, { message: searchRegex }];
  }

  // Optimized parallel queries using Promise.all & lean()
  const [inquiries, total] = await Promise.all([
    Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    Inquiry.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: inquiries,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

// @desc    Update inquiry status or admin notes (Admin)
// @route   PATCH /api/v1/inquiries/:id
export const updateInquiryStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  if (status && !['pending', 'read', 'replied'].includes(status as InquiryStatus)) {
    throw new AppError('Invalid status value', 400);
  }

  const updateData: Record<string, any> = {};
  if (status) updateData.status = status;
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

  const inquiry = await Inquiry.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).lean();

  if (!inquiry) {
    throw new AppError('Inquiry not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Inquiry updated successfully',
    data: inquiry,
  });
});

// @desc    Send email reply to user inquiry
// @route   POST /api/v1/inquiries/:id/reply
export const replyInquiry = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { replyMessage } = req.body;

  if (!replyMessage || !replyMessage.trim()) {
    throw new AppError('Reply message cannot be empty', 400);
  }

  const inquiry = await Inquiry.findById(id);

  if (!inquiry) {
    throw new AppError('Inquiry not found', 404);
  }

  // HTML Email Template for professional layout
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">LaptopVerse Support</h2>
      </div>
      <div style="padding: 24px; background-color: #ffffff;">
        <p>Dear <strong>${inquiry.name}</strong>,</p>
        <p>Thank you for reaching out to us. Here is our response regarding your inquiry:</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; white-space: pre-wrap; font-size: 14px; color: #1e293b;">${replyMessage}</p>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        
        <div style="font-size: 12px; color: #64748b;">
          <p style="margin-bottom: 4px;"><strong>Your Message:</strong></p>
          <blockquote style="margin: 0; padding-left: 10px; border-left: 2px solid #cbd5e1; italic;">
            "${inquiry.message}"
          </blockquote>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
        &copy; ${new Date().getFullYear()} LaptopVerse. All rights reserved.
      </div>
    </div>
  `;

  // Send Email using Utility
  await sendEmail({
    email: inquiry.email,
    subject: `Response to your inquiry - LaptopVerse`,
    message: replyMessage,
    html: emailHtml,
  });

  // Update Inquiry state in DB
  inquiry.status = 'replied';
  inquiry.replyMessage = replyMessage;
  inquiry.repliedAt = new Date();
  await inquiry.save();

  res.status(200).json({
    success: true,
    message: 'Reply sent successfully via email',
    data: inquiry,
  });
});

// @desc    Delete inquiry (Admin)
// @route   DELETE /api/v1/inquiries/:id
export const deleteInquiry = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const inquiry = await Inquiry.findByIdAndDelete(id);

  if (!inquiry) {
    throw new AppError('Inquiry not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Inquiry deleted successfully',
  });
});