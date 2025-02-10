import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch } from "./store";
import axios from "axios";
import { baseUrl } from "@/constants/baseUrl";

interface Room {
  id: number;
  typeName: string;
  price: number;
  roomImage: string;
  Area: number;
  totalRooms: number;
  status: string;
  propertyId: number;
  individualRooms: {
    id: number;
    roomNumber: string;
    status: string;
  }[];
}

interface RoomState {
  rooms: Room[];
  room: Room | null;
  isLoading: boolean;
}

const initialState: RoomState = {
  rooms: [],
  room: null,
  isLoading: false,
};

export const roomsSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.rooms = action.payload;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setRooms, setLoading } = roomsSlice.actions;

export default roomsSlice.reducer;

export const fetchRooms = () => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await axios.get(baseUrl + `/rooms`, {
        headers: { Authorization: `Bearer ${localStorage.access_token}` },
      });

      dispatch(setRooms(data));
    } catch (error) {
      console.log(error);
      dispatch(setLoading(false));
    }
  };
};
