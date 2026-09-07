import { apiSlice } from "@/app/services/apiSlice";

export interface IGuideImage {
  public_id: string;
  url: string;
}
export interface IGuide {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  category: string;
  readTime: string;
  image?: IGuideImage;
  isPublished: boolean;
  createdAt: string;
}

export interface IPagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface IGetAllGuidesAdminResponse {
  success: boolean;
  count: number;
  pagination: IPagination;
  guides: IGuide[];
}

export interface IGetAllGuidesAdminParams {
  status?: string;
  page?: number;
  limit?: number;
}

export const guideApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPublishedGuides: builder.query<{ success: boolean; guides: IGuide[] }, void>({
      query: () => "/guides",
      providesTags: ["Guide"],
    }),
    getAllGuidesAdmin: builder.query<IGetAllGuidesAdminResponse, IGetAllGuidesAdminParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.status && params.status !== "all") {
          queryParams.append("status", params.status);
        }
        if (params?.page) {
          queryParams.append("page", params.page.toString());
        }
        if (params?.limit) {
          queryParams.append("limit", params.limit.toString());
        }
        const queryString = queryParams.toString();
        return queryString ? `/guides/admin/all?${queryString}` : "/guides/admin/all";
      },
      providesTags: ["Guide"],
    }),
    getGuideByIdAdmin: builder.query<{ success: boolean; guide: IGuide }, string>({
      query: (id) => `/guides/admin/${id}`,
      providesTags: ["Guide"],
    }),
    createGuide: builder.mutation<{ success: boolean; message: string }, FormData>({
      query: (formData) => ({ url: "/guides/admin", method: "POST", body: formData }),
      invalidatesTags: ["Guide"],
    }),
    updateGuide: builder.mutation<{ success: boolean; message: string }, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({ url: `/guides/admin/${id}`, method: "PUT", body: formData }),
      invalidatesTags: ["Guide"],
    }),
    deleteGuide: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `/guides/admin/${id}`, method: "DELETE" }),
      invalidatesTags: ["Guide"],
    }),
  }),
});

export const {
  useGetPublishedGuidesQuery,
  useGetAllGuidesAdminQuery,
  useGetGuideByIdAdminQuery,
  useCreateGuideMutation,
  useUpdateGuideMutation,
  useDeleteGuideMutation,
} = guideApiSlice;