import { lazy, ReactNode, Suspense } from "react";
import CommonLoading from "./CommonLoading";

export default function LazyImport(cb: () => Promise<any>): ReactNode {
  const LazyComponent = lazy(cb);

  return (
    <Suspense fallback={<CommonLoading title={null}></CommonLoading>}>
      <LazyComponent></LazyComponent>
    </Suspense>
  );
}
