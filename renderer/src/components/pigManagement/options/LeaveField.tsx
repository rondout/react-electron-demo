import { useFormik } from "formik";
import moment from "moment";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ModifyPigParams } from "../../../models/pig.model";
import { $message, Yup } from "../../../utils";
import MatDatePicker from "../../common/mui/MatDatePicker";
import MatDialog, { MatDialogProps } from "../../common/mui/MatDialog";

export default function LeaveField(props: MatDialogProps<ModifyPigParams>) {
  const { t } = useTranslation();
  const { onOk: onPropsOk } = props;

  const formik = useFormik<ModifyPigParams>({
    validateOnMount: true,
    initialValues: { outPenTime: null, inPen: false },
    validationSchema: Yup.object({ outPenTime: Yup.string().required() }),
    onSubmit() {},
  });

  const getFieldProps = useCallback(
    (key: string) => {
      return {
        ...formik.getFieldProps(key),
        label: "pig.formLabels." + key,
        placeholder: t("pig.holders." + key),
        error: Boolean(formik.touched[key] && formik.errors[key]),
        // helperText: formik.touched[key] && formik.errors[key],
      };
    },
    [formik, t]
  );

  const onDateChange = useCallback(
    (date: string | number) => {
      formik.setFieldValue("outPenTime", moment(date).toISOString());
    },
    [formik]
  );

  const onOk = useCallback(() => {
    formik.handleSubmit();
    if (formik.isValid && formik.dirty && formik.dirty) {
      const result = onPropsOk({ ...formik.values, deviceId: null });
      // return new Promise<void>((r) => setTimeout(() => r(), 1000));
      return result;
    } else {
      $message.error("common.missRequiredFields");
    }
  }, [formik, onPropsOk]);

  const onClose = useCallback(() => {
    formik.resetForm();
    formik.validateForm();
    props.onClose && props.onClose();
  }, [props, formik]);

  return (
    <MatDialog {...props} title="pig.constants.OUT_PEN" size="xs" onOk={onOk} onClose={onClose}>
      <MatDatePicker sx={{ mb: 2 }} {...getFieldProps("outPenTime")} onChange={onDateChange}></MatDatePicker>
    </MatDialog>
  );
}
