import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from ".";

export interface CounterState {
  value: number;
}

const initState: CounterState = {
  value: 0,
};

export const counterSlice = createSlice({
  name: "counter",
  initialState: initState,
  reducers: {
    increment(state) {
      state.value += 1;
    },
    decrement(state) {
      state.value -= 1;
    },
    incrementByAmount(state, action: PayloadAction<number>) {
      state.value += action.payload;
    },
  },
});

export const { incrementByAmount, increment, decrement } = counterSlice.actions;

export const selectCount = (state: RootState) => state.counter.value;

export default counterSlice.reducer;
