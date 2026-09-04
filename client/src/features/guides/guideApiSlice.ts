import { apiSlice } from "@/app/services/apiSlice";

export interface IGuide {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  readTime: string;
  image?: string;
  isPublished: boolean;
  createdAt: string;
}

export const guideApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPublishedGuides: builder.query<{ success: boolean; guides: IGuide[] }, void>({
      query: () => "/guides",
      providesTags: ["Guide"],
    }),
    getAllGuidesAdmin: builder.query<{ success: boolean; guides: IGuide[] }, void>({
      query: () => "/admin/guides",
      providesTags: ["Guide"],
    }),
    createGuide: builder.mutation<{ success: boolean; message: string }, Partial<IGuide>>({
      query: (data) => ({ url: "/admin/guides", method: "POST", body: data }),
      invalidatesTags: ["Guide"],
    }),
    updateGuide: builder.mutation<{ success: boolean; message: string }, { id: string; data: Partial<IGuide> }>({
      query: ({ id, data }) => ({ url: `/admin/guides/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["Guide"],
    }),
    deleteGuide: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `/admin/guides/${id}`, method: "DELETE" }),
      invalidatesTags: ["Guide"],
    }),
  }),
});

export const {
  useGetPublishedGuidesQuery,
  useGetAllGuidesAdminQuery,
  useCreateGuideMutation,
  useUpdateGuideMutation,
  useDeleteGuideMutation,
} = guideApiSlice;