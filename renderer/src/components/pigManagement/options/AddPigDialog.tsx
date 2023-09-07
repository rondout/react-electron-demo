import { useFormik } from "formik";
import MatDialog, { MatDialogProps } from "../../common/mui/MatDialog";
import MatInput from "../../common/mui/MatInput";
import * as Yup from "yup";
import { BasePigInfo } from "../../../models/pig.model";
import { useCallback } from "react";
import pigController from "../../../controllers/pig.controller";
import { handleResponseError } from "../../../models/request.model";

interface AddPigDialogProps extends MatDialogProps {}

const initialValues: BasePigInfo = {
  pigNumber: undefined,
  // pigState: undefined,
  // devicePen: undefined,
};

export default function AddPigDialog(props: AddPigDialogProps) {
  const { onOk: onPropsOk, onClose: onPropsClose } = props;
  const formik = useFormik({
    initialValues,
    validateOnMount: true,
    validationSchema: Yup.object({
      pigNumber: Yup.string().required(),
      // name: Yup.string().required(),
      // pigState: Yup.string().optional(),
      // devicePen: Yup.string().required()
    }),
    onSubmit(values, formikHelpers) {},
  });

  // @ts-ignore
  window.f = formik;

  const getFieldProps = useCallback(
    (key: keyof BasePigInfo) => {
      return {
        ...formik.getFieldProps(key),
        label: "pig.formLabels." + key,
        // placeholder: t("pig.holders." + key),
        error: Boolean(formik.touched[key] && formik.errors[key]),
        // helperText: formik.touched[key] && formik.errors[key],
      };
    },
    [formik]
  );

  const onOk = useCallback(() => {
    formik.handleSubmit();
    if (formik.isValid && formik.dirty) {
      // return new Promise<void>((r) => setTimeout(() => r(), 1000));
      const result = pigController.createPig(formik.values);
      result
        .then(() => {
          onPropsOk && onPropsOk();
        })
        .catch(handleResponseError);
      return result;
    }
  }, [formik, onPropsOk]);

  const onClose = useCallback(() => {
    formik.resetForm();
    formik.validateForm();
    onPropsClose && onPropsClose();
  }, [formik, onPropsClose]);

  return (
    <MatDialog {...props} size="xs" title="pig.addPig" onClose={onClose} onOk={onOk}>
      <MatInput sx={{ mb: 2 }} {...getFieldProps("pigNumber")}></MatInput>
      {/* <MatInput sx={{ mb: 2 }} {...getFieldProps("name")}></MatInput> */}
      {/* <MatSelect sx={{ mb: 2 }} {...getFieldProps("pigState")} options={pigStateSelectOptions}></MatSelect> */}
      {/* <MatInput sx={{ mb: 2 }} {...getFieldProps("devicePen")}></MatInput> */}
    </MatDialog>
  );
}
