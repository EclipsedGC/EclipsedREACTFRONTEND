import { configureStore, createSlice } from '@reduxjs/toolkit'

// Dummy slice to prevent Redux store errors
// You can remove this when you add real slices
const dummySlice = createSlice({
  name: 'dummy',
  initialState: {},
  reducers: {}
})

export const store = configureStore({
  reducer: {
    dummy: dummySlice.reducer,
  },
})
