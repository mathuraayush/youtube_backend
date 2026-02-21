# Vidora Backend API Documentation

## Overview
This document covers the newly added features: Comments, Playlists, and Likes systems, as well as authentication configuration.

---

## Authentication Setup

### Token Flow
1. **Login Request** sends email/username + password
2. **Server Response** returns:
   - `accessToken` (JWT, short-lived)
   - `refreshToken` (long-lived, stored in httpOnly cookie)
   - User data
3. **Frontend Storage**:
   - Store `accessToken` in Redux state + localStorage
   - Cookies are automatically handled by the browser

### Frontend Configuration
Your `apiSlice.js` already has proper configuration:
```javascript
fetchBaseQuery({
  baseUrl: 'YOUR_API_URL/api/v1',
  credentials: 'include', // ✅ Allows cookies
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken
    if (token) headers.set('authorization', `Bearer ${token}`)
    return headers
  },
})
```

### Important Frontend Login Handling
When login succeeds, you must:
```javascript
// After successful login
const response = await login(credentials)
// Store the token from response
dispatch(setCredentials({
  user: response.data.user,
  accessToken: response.data.accessToken
}))
```

### Fixing "Unauthorized" Error
If you still get "Unauthorized" after login, check:
1. ✅ Token is being sent in Authorization header as `Bearer <token>`
2. ✅ Token is stored in Redux state (check devtools)
3. ✅ Token is not expired
4. ✅ Backend URL in apiSlice matches your deployment

---

## Comments System

### Add Comment
**Endpoint**: `POST /api/v1/comments/add/:videoId`
**Protected**: ✅ Yes

**Request Body**:
```json
{
  "content": "This is a great video!"
}
```

**Response**:
```json
{
  "statusCode": 201,
  "data": {
    "_id": "...",
    "content": "This is a great video!",
    "video": "videoId",
    "owner": {
      "_id": "userId",
      "username": "username",
      "avatar": "url",
      "fullName": "Full Name"
    },
    "createdAt": "2025-02-21T...",
    "updatedAt": "2025-02-21T..."
  },
  "message": "Comment added successfully"
}
```

### Get Video Comments
**Endpoint**: `GET /api/v1/comments/videos/:videoId?page=1&limit=10`
**Protected**: ❌ No

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "comments": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  },
  "message": "Comments fetched successfully"
}
```

### Update Comment
**Endpoint**: `PATCH /api/v1/comments/:commentId`
**Protected**: ✅ Yes (Only your own comments)

**Request Body**:
```json
{
  "content": "Updated comment text"
}
```

### Delete Comment
**Endpoint**: `DELETE /api/v1/comments/:commentId`
**Protected**: ✅ Yes (Only your own comments)

---

## Playlists System

### Create Playlist
**Endpoint**: `POST /api/v1/playlists/create`
**Protected**: ✅ Yes

**Request Body**:
```json
{
  "name": "My Favorites",
  "description": "Collection of my favorite videos"
}
```

### Get User Playlists
**Endpoint**: `GET /api/v1/playlists/user/:userId`
**Protected**: ❌ No

**Response**:
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "playlistId",
      "name": "My Favorites",
      "description": "...",
      "owner": {...},
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "message": "User playlists fetched successfully"
}
```

### Get Playlist by ID
**Endpoint**: `GET /api/v1/playlists/:playlistId`
**Protected**: ❌ No

**Response includes full video details**

### Add Video to Playlist
**Endpoint**: `PATCH /api/v1/playlists/:playlistId/add/:videoId`
**Protected**: ✅ Yes (Only playlist owner)

### Remove Video from Playlist
**Endpoint**: `PATCH /api/v1/playlists/:playlistId/remove/:videoId`
**Protected**: ✅ Yes (Only playlist owner)

### Update Playlist
**Endpoint**: `PATCH /api/v1/playlists/:playlistId`
**Protected**: ✅ Yes (Only playlist owner)

**Request Body**:
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

### Delete Playlist
**Endpoint**: `DELETE /api/v1/playlists/:playlistId`
**Protected**: ✅ Yes (Only playlist owner)

---

## Likes System

### Toggle Video Like
**Endpoint**: `POST /api/v1/likes/toggle/video/:videoId`
**Protected**: ✅ Yes

**Response**:
```json
{
  "statusCode": 201,
  "data": {
    "isLiked": true
  },
  "message": "Video liked"
}
```

### Toggle Comment Like
**Endpoint**: `POST /api/v1/likes/toggle/comment/:commentId`
**Protected**: ✅ Yes

### Get Video Likes
**Endpoint**: `GET /api/v1/likes/video/:videoId`
**Protected**: ✅ Yes

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "likesCount": 15,
    "isLiked": true
  },
  "message": "Video likes fetched successfully"
}
```

### Get Comment Likes
**Endpoint**: `GET /api/v1/likes/comment/:commentId`
**Protected**: ✅ Yes

### Get User's Liked Videos
**Endpoint**: `GET /api/v1/likes/user/videos?page=1&limit=10`
**Protected**: ✅ Yes

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "videos": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  },
  "message": "Liked videos fetched successfully"
}
```

---

## CORS Configuration
The backend is configured to:
- ✅ Accept requests from **ANY origin** (as per your requirement)
- ✅ Allow credentials (cookies) in requests
- ✅ Support all HTTP methods (GET, POST, PUT, PATCH, DELETE)

### Frontend Integration
Add the new API endpoints to your `services.js`:

```javascript
// Comments
getVideoComments: builder.query({
  query: ({ videoId, page = 1, limit = 10 }) => 
    `/comments/videos/${videoId}?page=${page}&limit=${limit}`,
}),
addComment: builder.mutation({
  query: ({ videoId, content }) => ({
    url: `/comments/add/${videoId}`,
    method: 'POST',
    body: { content }
  }),
}),
updateComment: builder.mutation({
  query: ({ commentId, content }) => ({
    url: `/comments/${commentId}`,
    method: 'PATCH',
    body: { content }
  }),
}),
deleteComment: builder.mutation({
  query: (commentId) => ({
    url: `/comments/${commentId}`,
    method: 'DELETE'
  }),
}),

// Playlists
createPlaylist: builder.mutation({
  query: (payload) => ({
    url: '/playlists/create',
    method: 'POST',
    body: payload
  }),
}),
getUserPlaylists: builder.query({
  query: (userId) => `/playlists/user/${userId}`,
}),
getPlaylistById: builder.query({
  query: (playlistId) => `/playlists/${playlistId}`,
}),
addVideoToPlaylist: builder.mutation({
  query: ({ playlistId, videoId }) => ({
    url: `/playlists/${playlistId}/add/${videoId}`,
    method: 'PATCH',
  }),
}),
removeVideoFromPlaylist: builder.mutation({
  query: ({ playlistId, videoId }) => ({
    url: `/playlists/${playlistId}/remove/${videoId}`,
    method: 'PATCH',
  }),
}),
updatePlaylist: builder.mutation({
  query: ({ playlistId, ...payload }) => ({
    url: `/playlists/${playlistId}`,
    method: 'PATCH',
    body: payload
  }),
}),
deletePlaylist: builder.mutation({
  query: (playlistId) => ({
    url: `/playlists/${playlistId}`,
    method: 'DELETE'
  }),
}),

// Likes
toggleVideoLike: builder.mutation({
  query: (videoId) => ({
    url: `/likes/toggle/video/${videoId}`,
    method: 'POST',
  }),
}),
toggleCommentLike: builder.mutation({
  query: (commentId) => ({
    url: `/likes/toggle/comment/${commentId}`,
    method: 'POST',
  }),
}),
getVideoLikes: builder.query({
  query: (videoId) => `/likes/video/${videoId}`,
}),
getCommentLikes: builder.query({
  query: (commentId) => `/likes/comment/${commentId}`,
}),
getLikedVideos: builder.query({
  query: ({ page = 1, limit = 10 }) => 
    `/likes/user/videos?page=${page}&limit=${limit}`,
}),
```

---

## Troubleshooting

### "Unauthorized request - No token found"
- Check if token is in Redux state
- Check if Authorization header is being sent
- Check if token is not expired

### Authentication works in Postman but not frontend
1. Open DevTools → Network tab
2. Check request headers include `Authorization: Bearer <token>`
3. Check response includes the token in the body
4. Verify CORS headers in response

### Cookies not being set
- Your frontend baseUrl must match the API domain
- Ensure `credentials: 'include'` is set in apiSlice
- Check browser console for CORS errors

### Getting 403 Forbidden when updating/deleting
- Only the resource owner can modify it
- Ensure you're using the correct user's token
- Check that req.user._id matches the owner

---

## Database Models

### Comment
```
{
  content: String (required),
  video: ObjectId (ref: Video),
  owner: ObjectId (ref: User),
  timestamps: true
}
```

### Playlist
```
{
  name: String (required),
  description: String,
  videos: [ObjectId] (refs: Video),
  owner: ObjectId (ref: User),
  timestamps: true
}
```

### Like
```
{
  video: ObjectId (ref: Video),
  comment: ObjectId (ref: Comment),
  tweet: ObjectId (ref: Tweet),
  likedBy: ObjectId (ref: User),
  timestamps: true
}
```
Note: Only one of video/comment/tweet can be set per like

---

## HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

