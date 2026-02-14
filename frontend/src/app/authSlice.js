import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  theme: localStorage.getItem('theme') || 'dark',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      if (action.payload.accessToken) localStorage.setItem('accessToken', action.payload.accessToken)
    },
    clearCredentials: (state) => {
      state.user = null
      state.accessToken = null
      localStorage.removeItem('accessToken')
    },
    setTheme: (state, action) => {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
    },
  },
})

export const { setCredentials, clearCredentials, setTheme } = authSlice.actions
export default authSlice.reducer
