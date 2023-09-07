import { useFormik } from "formik";
import { memo, useCallback } from "react";
import { ModifyPigParams, strategyLevelSelectOptions } from "../../../models/pig.model";
import { Yup } from "../../../utils";
import MatDialog, { MatDialogProps } from "../../common/mui/MatDialog";
import MatSelect from "../../common/mui/MatSelect";

interface ModifyWeightStrategyProps extends MatDialogProps {}

const ModifyWeightStrategy = memo(function (props: ModifyWeightStrategyProps) {
  const { onOk: onPropsOk = () => {} } = props;

  const formik = useFormik<ModifyPigParams>({
    initialValues: { strategyLevel: undefined },
    validateOnMount: true,
    validationSchema: Yup.object({ strategyLevel: Yup.number().required() }),
    onSubmit(values, formikHelpers) {},
  });

  const onClose = useCallback(() => {
    formik.resetForm();
    formik.validateForm();
    props.onClose && props.onClose();
  }, [props, formik]);

  const onOk = useCallback(() => {
    formik.handleSubmit();
    if (formik.isValid && formik.dirty && onPropsOk) {
      return onPropsOk(formik.values);
    }
    return;
  }, [onPropsOk, formik]);

  return (
    <MatDialog {...props} size="xs" title="pig.constants.MODIFY_STRATEGY_LEVEL" onClose={onClose} onOk={onOk}>
      <MatSelect
        error={!!(formik.touched.strategyLevel && formik.errors.strategyLevel)}
        label="pig.formLabels.strategyLevel"
        {...formik.getFieldProps("strategyLevel")}
        options={strategyLevelSelectOptions}
      ></MatSelect>
    </MatDialog>
  );
});

export default ModifyWeightStrategy;
