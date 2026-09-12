import { Document } from 'mongoose';

export type InquiryStatus = 'pending' | 'read' | 'replied';

export interface IInquiry extends Document {
  name: string;
  email: string;
  message: string;
  status: InquiryStatus;
  adminNotes?: string;
  replyMessage?: string;
  repliedAt?: string | Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInquiryQueryFilters {
  page?: number;
  limit?: number;
  status?: InquiryStatus | 'all';
  search?: string;
}