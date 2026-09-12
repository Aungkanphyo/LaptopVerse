export type InquiryStatus = 'pending' | 'read' | 'replied';

export interface IInquiry {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: InquiryStatus;
  adminNotes?: string;
  replyMessage?: string;
  repliedAt?: string | Date;
  createdAt: string;
  updatedAt: string;
}

export interface IInquiryPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IInquiryResponse {
  success: boolean;
  data: IInquiry[];
  pagination: IInquiryPagination;
}

export interface ISubmitInquiryRequest {
  name: string;
  email: string;
  message: string;
}

export interface IUpdateInquiryRequest {
  id: string;
  status?: InquiryStatus;
  adminNotes?: string;
}

export interface IGetInquiriesParams {
  page?: number;
  limit?: number;
  status?: InquiryStatus | 'all';
  search?: string;
}