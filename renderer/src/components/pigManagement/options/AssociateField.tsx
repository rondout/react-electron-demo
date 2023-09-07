import { useFormik } from "formik";
import moment from "moment";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import deviceController from "../../../controllers/device.controller";
import useDataFetch from "../../../hooks/useDataFetch";
import { DeviceInfo } from "../../../models/device.model";
import { ModifyPigParams, pigStateSelectOptions } from "../../../models/pig.model";
import { $message, Yup } from "../../../utils";
import MatDatePicker from "../../common/mui/MatDatePicker";
import MatDialog, { MatDialogProps } from "../../common/mui/MatDialog";
import MatSelect, { MatSelectOption, MatSelectOptionFactory } from "../../common/mui/MatSelect";

export default function AssociateField(props: MatDialogProps) {
  const { t } = useTranslation();
  const { onOk: onPropsOk, open } = props;
  const { data = [], fetchData } = useDataFetch<DeviceInfo[]>({ fetchFn: deviceController.getAvailableDevices, pageLink: null });

  useEffect(() => {
    open && fetchData();
  }, [open, fetchData]);

  const formik = useFormik<ModifyPigParams>({
    validateOnMount: true,
    initialValues: { inPenTime: null, deviceId: null, pigState: undefined },
    validationSchema: Yup.object({ inPenTime: Yup.string().required(), deviceId: Yup.string().required(), pigState: Yup.string().required() }),
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
      formik.setFieldValue("inPenTime", moment(date).toISOString());
    },
    [formik]
  );

  const onOk = useCallback(() => {
    formik.handleSubmit();
    if (formik.isValid && formik.dirty) {
      return onPropsOk({ ...formik.values, inPen: true });
      // return new Promise<void>((r) => setTimeout(() => r(), 1000));
    } else {
      $message.error("common.missRequiredFields");
    }
  }, [formik, onPropsOk]);

  const onClose = useCallback(() => {
    formik.resetForm();
    formik.validateForm();
    props.onClose && props.onClose();
  }, [props, formik]);

  const selectOptions = useMemo<MatSelectOption[]>(() => {
    return data.map((device) => new MatSelectOptionFactory(device.id, `${device.attributes?.devicePen || ""} (${device.sn})`));
    // return data.filter((device) => !!device.attributes?.devicePen).map((device) => new MatSelectOptionFactory(device.id, `${device.attributes?.devicePen || ""} (${device.sn})`));
  }, [data]);

  return (
    <MatDialog {...props} title="pig.constants.IN_PEN" size="xs" onOk={onOk} onClose={onClose}>
      {/* <MatInput sx={{ mb: 2 }} {...getFieldProps("no")}></MatInput> */}
      <MatDatePicker sx={{ mb: 2 }} {...getFieldProps("inPenTime")} onChange={onDateChange}></MatDatePicker>
      <MatSelect options={selectOptions} sx={{ mb: 2 }} {...getFieldProps("deviceId")}></MatSelect>
      <MatSelect sx={{ mb: 2 }} {...getFieldProps("pigState")} options={pigStateSelectOptions}></MatSelect>
    </MatDialog>
  );
}
