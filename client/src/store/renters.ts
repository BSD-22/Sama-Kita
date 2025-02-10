import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch } from "./store.ts";
import axios from "axios";

// Define a type for the slice state
interface CounterState<T> {
  renters: T;
  renter: T | null;
}

// Define the initial state using that type
const initialState: CounterState<[]> = {
  renters: [],
  renter: null,
};

export const renterSlice = createSlice({
  name: "renters",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setRenters: (state, action: PayloadAction<[]>) => {
      state.renters = action.payload;
    },
  },
});

export const { setRenters } = renterSlice.actions;

export default renterSlice.reducer;

export const fetchRenters = () => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data } = await axios.get(`http://localhost:8080/renters`, { headers: { Authorization: `Bearer ${localStorage.access_token}` } });

      dispatch(setRenters(data));
    } catch (error) {
      console.log(error);
    }
  };
};
