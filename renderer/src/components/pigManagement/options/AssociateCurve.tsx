import { useFormik } from "formik";
import { memo, useCallback, useMemo } from "react";
import feedController from "../../../controllers/feed.controller";
import useDataFetch from "../../../hooks/useDataFetch";
import { ModifyPigParams } from "../../../models/pig.model";
import { MAX_SAFE_PAGE_SIZE, PageLink } from "../../../models/request.model";
import { dateFormat, Yup } from "../../../utils";
import MatDatePicker from "../../common/mui/MatDatePicker";
import MatDialog, { MatDialogProps } from "../../common/mui/MatDialog";
import MatSelect, { MatSelectOption, MatSelectOptionFactory } from "../../common/mui/MatSelect";

interface AssociateCurveProps extends MatDialogProps {}

const AssociateCurve = memo(function (props: AssociateCurveProps) {
  const { onOk: onPropsOk = () => {} } = props;
  const { data, loading } = useDataFetch({ fetchFn: feedController.getFeedCurves, pageLink: new PageLink(0, MAX_SAFE_PAGE_SIZE) });

  const formik = useFormik<ModifyPigParams>({
    initialValues: { curveId: undefined, curveStartDate: null },
    validateOnMount: true,
    validationSchema: Yup.object({ curveId: Yup.string().required(), curveStartDate: Yup.string().required() }),
    onSubmit(values, formikHelpers) {},
  });

  const curveSelectOptions: MatSelectOption[] = useMemo(() => {
    if (!data?.result) {
      return [];
    }
    return data.result.map((item) => new MatSelectOptionFactory(item.id, item.curveName));
  }, [data?.result]);

  const onClose = useCallback(() => {
    formik.resetForm();
    formik.validateForm();
    props.onClose && props.onClose();
  }, [props, formik]);

  const onDateChange = useCallback(
    (date: string | number) => {
      formik.setFieldValue("curveStartDate", dateFormat(date, "YYYY-MM-DD"));
    },
    [formik]
  );

  const onOk = useCallback(() => {
    // formik.validateForm();
    formik.handleSubmit();
    if (formik.isValid && formik.dirty && onPropsOk) {
      return onPropsOk(formik.values);
    }
    return;
  }, [onPropsOk, formik]);

  return (
    <MatDialog {...props} size="xs" title="pig.constants.LINK_FEED_CURVE" onClose={onClose} onOk={onOk}>
      <MatSelect
        error={!!(formik.touched.curveId && formik.errors.curveId)}
        loading={loading}
        label="pig.formLabels.curve"
        {...formik.getFieldProps("curveId")}
        options={curveSelectOptions}
      ></MatSelect>
      <MatDatePicker
        error={!!(formik.touched.curveStartDate && formik.errors.curveStartDate)}
        sx={{ mt: 2 }}
        label="pig.formLabels.date"
        {...formik.getFieldProps("curveStartDate")}
        onChange={onDateChange}
      ></MatDatePicker>
    </MatDialog>
  );
});

export default AssociateCurve;
