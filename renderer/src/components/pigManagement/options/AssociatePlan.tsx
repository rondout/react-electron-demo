import { useFormik } from "formik";
import { memo, useCallback, useMemo } from "react";
import feedController from "../../../controllers/feed.controller";
import useDataFetch from "../../../hooks/useDataFetch";
import { ModifyPigParams } from "../../../models/pig.model";
import { MAX_SAFE_PAGE_SIZE, PageLink } from "../../../models/request.model";
import { Yup } from "../../../utils";
import MatDialog, { MatDialogProps } from "../../common/mui/MatDialog";
import MatSelect, { MatSelectOption, MatSelectOptionFactory } from "../../common/mui/MatSelect";

interface AssociatePlanProps extends MatDialogProps {}

const AssociatePlan = memo(function (props: AssociatePlanProps) {
  const { onOk: onPropsOk = () => {} } = props;
  const { data, loading } = useDataFetch({ fetchFn: feedController.getFeedPlans, pageLink: new PageLink(0, MAX_SAFE_PAGE_SIZE) });

  const formik = useFormik<ModifyPigParams>({
    initialValues: { planId: undefined },
    validateOnMount: true,
    validationSchema: Yup.object({ planId: Yup.string().required() }),
    onSubmit(values, formikHelpers) {},
  });

  const planSelectOptions: MatSelectOption[] = useMemo(() => {
    if (!data?.result) {
      return [];
    }
    return data.result.map((item) => new MatSelectOptionFactory(item.id, item.planName));
  }, [data?.result]);

  const onClose = useCallback(() => {
    formik.resetForm();
    formik.validateForm();
    props.onClose && props.onClose();
  }, [props, formik]);

  const onOk = useCallback(() => {
    // formik.validateForm();
    formik.handleSubmit();
    if (formik.isValid && formik.dirty && onPropsOk) {
      return onPropsOk(formik.values);
    }
    return;
  }, [onPropsOk, formik]);

  return (
    <MatDialog {...props} size="xs" title="pig.constants.LINK_FEED_PLAN" onClose={onClose} onOk={onOk}>
      <MatSelect
        error={!!(formik.touched.planId && formik.errors.planId)}
        loading={loading}
        label="pig.formLabels.plan"
        {...formik.getFieldProps("planId")}
        options={planSelectOptions}
      ></MatSelect>
    </MatDialog>
  );
});

export default AssociatePlan;
