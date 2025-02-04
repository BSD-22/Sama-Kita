import { configureStore } from "@reduxjs/toolkit";
import renterReducer from "./renters";
import propertyReducer from "./properties";
// ...

export const store = configureStore({
  reducer: {
    renters: renterReducer,
    properties: propertyReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
