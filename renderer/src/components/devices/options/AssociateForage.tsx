import { ChangeEvent, useCallback, useMemo, useState } from "react";
import feedController from "../../../controllers/feed.controller";
import useDataFetch from "../../../hooks/useDataFetch";
import { PageLink, MAX_SAFE_PAGE_SIZE } from "../../../models/request.model";
import MatDialog, { MatDialogProps } from "../../common/mui/MatDialog";
import MatSelect, { MatSelectOptionFactory } from "../../common/mui/MatSelect";

interface AssociateForageProps extends MatDialogProps {}

// @ts-ignorea
export default function AssociateForage(props: AssociateForageProps) {
  const [selectedForage, setSelectedForage] = useState<string>();
  const { data, loading } = useDataFetch({ fetchFn: feedController.getForages, pageLink: new PageLink(0, MAX_SAFE_PAGE_SIZE) });

  const options = useMemo(() => {
    return data?.result.map((v) => new MatSelectOptionFactory(v.id, v.forageName));
  }, [data?.result]);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSelectedForage(e.target.value);
  }, []);

  const handleOk = useCallback(() => {
    return props.onOk && props.onOk(selectedForage);
  }, [props, selectedForage]);

  return (
    <MatDialog {...props} size="xs" title={"device.associateForage"} onOk={handleOk}>
      <MatSelect options={options} loading={loading} value={selectedForage} label="feed.forageName" onChange={onChange}></MatSelect>
    </MatDialog>
  );
}
