import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";
import mainReducer from "./mainSlice";
import toolReducer from "./toolSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    main: mainReducer,
    tool: toolReducer,
  },
  middleware(getDefault) {
    return getDefault({ serializableCheck: false });
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
