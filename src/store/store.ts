import { configureStore } from '@reduxjs/toolkit'
import { stateSlice } from './appSlice'

export const store = configureStore({
  reducer: {
    data: stateSlice.reducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
