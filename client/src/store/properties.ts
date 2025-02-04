import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "./store.ts";
import axios from "axios";

// Define a type for the slice state
interface CounterState<T> {
  properties: T;
  property: T | null;
}

// Define the initial state using that type
const initialState: CounterState<[]> = {
  properties: [],
  property: null,
};

export const propertiesSlice = createSlice({
  name: "properties",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setProperties: (state, action: PayloadAction<[]>) => {
      state.properties = action.payload;
    },
  },
});

export const { setProperties } = propertiesSlice.actions;

export default propertiesSlice.reducer;

export const fetchProperties = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const { data } = await axios.get(`http://localhost:8080/properties`, { headers: { Authorization: `Bearer ${localStorage.access_token}` } });

      dispatch(setProperties(data));
    } catch (error) {
      console.log(error);
    }
  };
};
