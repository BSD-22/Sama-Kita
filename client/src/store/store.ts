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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
