import { useCallback, useEffect, useState } from "react";
import { BaseData } from "../models/base.model";
import { handleResponseError, PageLinkInterface, ResponseContent } from "../models/request.model";
import { shallowClone } from "../utils";

interface UseDataFetchParams<T, P extends PageLinkInterface = PageLinkInterface> {
  pageLink: P;
  fetchFn(p: P): Promise<T>;
}

export default function useDataFetch<T = ResponseContent<BaseData>, P extends PageLinkInterface = PageLinkInterface>(params: UseDataFetchParams<T, P>) {
  const { fetchFn } = params;
  const [pageLink, setPageLink] = useState<P>(params.pageLink);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T>();

  const fetchData = useCallback(() => {
    if (pageLink?.fetchTrigger && !pageLink?.fetchTrigger(pageLink)) {
      return;
    }
    setLoading(true);
    fetchFn(pageLink)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        handleResponseError(err);
        setLoading(false);
      });
  }, [pageLink, fetchFn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback((resetPage = false) => {
    setPageLink((prev) => (prev ? shallowClone(Object.assign(prev, { pageOffset: resetPage ? 0 : prev.pageOffset })) : null));
  }, []);

  const setPage = useCallback((pageOffset: number) => {
    setPageLink((prev) => shallowClone(Object.assign(prev, { pageOffset })));
  }, []);

  type SetPagLinkParam = {
    [key in keyof P]?: any;
  };

  const setPagelinkParams = useCallback((param: SetPagLinkParam | ((prev: P) => SetPagLinkParam)) => {
    if (typeof param === "function") {
      setPageLink((prev) => {
        Object.assign(prev, param(prev));
        return shallowClone(prev);
      });
    } else {
      setPageLink((prev) => {
        Object.assign(prev, param);
        return shallowClone(prev);
      });
    }
  }, []);

  return { loading, data, page: pageLink?.pageOffset, setPage, setPagelinkParams, refresh, pageLink, fetchData };
}
