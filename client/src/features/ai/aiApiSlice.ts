import { apiSlice } from '../../app/services/apiSlice';

export interface AiResponse {
  success: boolean;
  data: {
    answer: string;
  };
}

export interface AiRequest {
  prompt: string;
}

export const aiApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    askAiAdvisor: builder.mutation<AiResponse, AiRequest>({
      query: (body) => ({
        url: '/ai/ask',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useAskAiAdvisorMutation } = aiApiSlice;