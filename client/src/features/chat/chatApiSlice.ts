// client/src/features/chat/chatApiSlice.ts
import { apiSlice } from '@/app/services/apiSlice';
import type { IChatMessage, IConversation } from '@/types/chat.types';

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // To retrieve a conversation for a logged-in user or a guest user
    getMyConversation: builder.query<
      { success: boolean; data: IConversation; conversation?: IConversation },
      { guestId?: string } | void
    >({
      query: (params) => {
        if (params?.guestId) {
          return `/chat/my-conversation?guestId=${encodeURIComponent(params.guestId)}`;
        }
        return '/chat/my-conversation';
      },
      providesTags: ['Chat'],
    }),

    // To retrieve all messages from a conversation (may include Guest ID)
    getMessagesByConversation: builder.query<
      { success: boolean; data: IChatMessage[]; messages?: IChatMessage[] },
      { conversationId: string; guestId?: string }
    >({
      query: ({ conversationId, guestId }) => {
        let url = `/chat/messages/${conversationId}`;
        if (guestId) {
          url += `?guestId=${encodeURIComponent(guestId)}`;
        }
        return url;
      },
      providesTags: (result, error, { conversationId }) => [{ type: 'Chat', id: conversationId }],
    }),

    // To retrieve all conversations for the admin
    getAllConversations: builder.query<
      { success: boolean; data: IConversation[]; conversations?: IConversation[] },
      void
    >({
      query: () => '/chat/conversations',
      providesTags: ['Chat'],
    }),

    // To change conversation status (open/closed)
    toggleConversationStatus: builder.mutation<
      { success: boolean; data: IConversation },
      { conversationId: string; status: 'open' | 'closed' }
    >({
      query: ({ conversationId, status }) => ({
        url: `/chat/conversations/${conversationId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Chat'],
    }),
  }),
});

export const {
  useGetMyConversationQuery,
  useGetMessagesByConversationQuery,
  useGetAllConversationsQuery,
  useToggleConversationStatusMutation,
} = chatApiSlice;