import { debounce } from "@mui/material";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectWindowSize, setWindowSize } from "../store/mainSlice";

export default function useWindowSize() {
  const dispatch = useDispatch();
  const { innerHeight, innerWidth } = useSelector(selectWindowSize);

  const watchWindowSize = useCallback(() => {
    const { innerHeight, innerWidth } = window;
    dispatch(setWindowSize({ innerWidth, innerHeight }));

    const watchWindowSize = function () {
      const { innerHeight, innerWidth } = window;
      dispatch(setWindowSize({ innerWidth, innerHeight }));
    };
    window.onresize = debounce(watchWindowSize, 300);
  }, [dispatch]);

  return { innerHeight, innerWidth, watchWindowSize };
}
