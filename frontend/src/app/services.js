import { apiSlice } from './apiSlice'

export const appApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (formData) => ({ url: '/users/register', method: 'POST', body: formData }),
    }),
    login: builder.mutation({
      query: (payload) => ({ url: '/users/login', method: 'POST', body: payload }),
    }),
    logout: builder.mutation({
      query: () => ({ url: '/users/logout', method: 'POST' }),
    }),
    refreshToken: builder.mutation({
      query: (payload) => ({ url: '/users/refreshAccessToken', method: 'POST', body: payload }),
    }),
    getCurrentUser: builder.query({
      query: () => '/users/getcurrentUser',
      providesTags: ['User'],
    }),
    updateAccount: builder.mutation({
      query: (payload) => ({ url: '/users/updateAcoountDetails', method: 'PATCH', body: payload }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation({
      query: (payload) => ({ url: '/users/changeCurrentPassword', method: 'POST', body: payload }),
    }),
    updateAvatar: builder.mutation({
      query: (formData) => ({ url: '/users/updateUserAvatar', method: 'PATCH', body: formData }),
      invalidatesTags: ['User'],
    }),
    updateCover: builder.mutation({
      query: (formData) => ({ url: '/users/updateUserCoverImage', method: 'PATCH', body: formData }),
      invalidatesTags: ['User'],
    }),
    getChannelProfile: builder.query({
      query: (username) => `/users/c/${username}`,
    }),
    getHistory: builder.query({
      query: () => '/users/history',
      providesTags: ['History'],
    }),
    getVideos: builder.query({
      query: ({ page = 1, limit = 12 } = {}) => `/videos?page=${page}&limit=${limit}`,
      providesTags: ['Videos'],
    }),
    getVideoById: builder.query({
      query: (videoId) => `/videos/${videoId}`,
    }),
    incrementViews: builder.mutation({
      query: (videoId) => ({ url: `/videos/${videoId}/views`, method: 'POST' }),
    }),
    getChannelVideos: builder.query({
      query: ({ userId, page = 1, limit = 12 }) => `/videos/channel/${userId}?page=${page}&limit=${limit}`,
    }),
    uploadVideo: builder.mutation({
      query: (formData) => ({ url: '/videos/upload', method: 'POST', body: formData }),
      invalidatesTags: ['Videos'],
    }),
    updateVideo: builder.mutation({
      query: ({ videoId, ...payload }) => ({ url: `/videos/${videoId}`, method: 'PATCH', body: payload }),
      invalidatesTags: ['Videos'],
    }),
    deleteVideo: builder.mutation({
      query: (videoId) => ({ url: `/videos/${videoId}`, method: 'DELETE' }),
      invalidatesTags: ['Videos'],
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useUpdateAccountMutation,
  useChangePasswordMutation,
  useUpdateAvatarMutation,
  useUpdateCoverMutation,
  useGetChannelProfileQuery,
  useGetHistoryQuery,
  useGetVideosQuery,
  useGetVideoByIdQuery,
  useIncrementViewsMutation,
  useGetChannelVideosQuery,
  useUploadVideoMutation,
  useUpdateVideoMutation,
  useDeleteVideoMutation,
} = appApi
