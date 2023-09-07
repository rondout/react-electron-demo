import { ChangeEvent, memo, useCallback, useEffect, useState } from "react";
import { PigStatus, pigStateSelectOptions, ModifyPigParams } from "../../../models/pig.model";
import { $message } from "../../../utils";
import MatDialog, { MatDialogProps } from "../../common/mui/MatDialog";
import MatSelect from "../../common/mui/MatSelect";

interface ModifyPigStateProps extends MatDialogProps {
  originStatus: PigStatus;
}

const ModifyPigState = memo(function (props: ModifyPigStateProps) {
  const { originStatus, onOk: onPropsOk = () => {}, open } = props;
  const [value, setValue] = useState<PigStatus>(props.originStatus);

  useEffect(() => {
    setValue((prev) => {
      if (prev !== originStatus || open) {
        return originStatus;
      }
      return prev;
    });
  }, [originStatus, open]);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value as PigStatus);
  }, []);

  const onClose = useCallback(() => {
    setValue(undefined);
    props.onClose && props.onClose();
  }, [props]);

  const onOk = useCallback(() => {
    if (!value) {
      $message.error("pig.statusRequired");
      return;
    }
    return onPropsOk({ pigState: value } as ModifyPigParams);
  }, [onPropsOk, value]);

  return (
    <MatDialog {...props} size="xs" title="pig.modifyStatus" onClose={onClose} onOk={onOk}>
      <MatSelect label="pig.formLabels.pigState" onChange={onChange} value={value} options={pigStateSelectOptions}></MatSelect>
    </MatDialog>
  );
});

export default ModifyPigState;
