import { Box } from "@mui/material";
import { useFormik } from "formik";
import { useCallback } from "react";
import userController from "../../../controllers/user.controller";
import { handleResponseError } from "../../../models/request.model";
import { $message, Yup } from "../../../utils";
import MatDialog from "../mui/MatDialog";
import MatPassword from "../mui/MatPassword";

export function ResetPassword(props: { open: boolean; handleClose(): void; handleLogout(): void }) {
  const formik = useFormik({
    initialValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
    validateOnMount: true,
    validateOnChange: true,
    validationSchema: Yup.object({
      oldPassword: Yup.string().required("common.missRequiredFields").min(6, "user.createAdminErrors.passwordMin6"),
      newPassword: Yup.string().required("common.missRequiredFields").min(6, "user.createAdminErrors.passwordMin6"),
      confirmPassword: Yup.string().required("common.missRequiredFields").min(6, "user.createAdminErrors.passwordMin6"),
    }),
    onSubmit() {},
  });

  const { handleLogout, open } = props;

  const getFieldProps = (key: string) => {
    return {
      ...formik.getFieldProps(key),
      label: "user." + key,
      error: !!(formik.touched[key] && formik.errors[key]),
      // helperText: formik.errors[key],
    };
  };

  const handleClose = useCallback(() => {
    formik.resetForm();
    props.handleClose();
  }, [props, formik]);

  const handleOk = useCallback(() => {
    formik.handleSubmit();
    const errorMessage = Object.values(formik.errors)[0];
    if (errorMessage) {
      $message.error(errorMessage);
      return;
    }
    if (formik.values.confirmPassword !== formik.values.newPassword) {
      $message.error("user.createAdminErrors.passwordNotSame");
      return;
    } else {
      if (formik.isValid && formik.dirty) {
        // return new Promise<void>((r) => {
        //   setTimeout(() => r(), 1000);
        // });
        const { oldPassword, newPassword } = formik.values;
        const result = userController.modifyPassword({ oldPassword, newPassword });
        result
          .then(() => {
            $message.success("user.modifyPwdSuccess");
            handleLogout();
          })
          .catch((err) => {
            if (err?.data?.errorCode === "COMMON_UNAUTHORIZED") {
              $message.error("user.createAdminErrors.pwdError");
            } else {
              handleResponseError(err);
            }
          });
        return result;
      }
    }
    // formik
  }, [formik, handleLogout]);

  return (
    <MatDialog open={open} size="xs" onClose={handleClose} onOk={handleOk} title="user.resetPassword">
      <Box sx={{ mb: 3 }}>
        <MatPassword type="standard" {...getFieldProps("oldPassword")}></MatPassword>
      </Box>
      <Box sx={{ mb: 3 }}>
        <MatPassword type="standard" {...getFieldProps("newPassword")}></MatPassword>
      </Box>
      <Box sx={{}}>
        <MatPassword type="standard" {...getFieldProps("confirmPassword")}></MatPassword>
      </Box>
    </MatDialog>
  );
}
