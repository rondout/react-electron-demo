import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { selectConfig, setExtraConfig } from "../../../store/mainSlice";
import { $message, Yup } from "../../../utils";
import MatDialog, { MatDialogProps } from "../mui/MatDialog";
import MatInput from "../mui/MatInput";

interface ConfigServerUrlessProps extends MatDialogProps {}

export default function ConfigServerUrl(props: ConfigServerUrlessProps) {
  const config = useSelector(selectConfig);
  const { t } = useTranslation();
  const [serverUrl, setUrl] = useState(config.base_url || "");
  const dispatch = useDispatch();

  const handleOk = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      Yup.string()
        .url("user.urlInvalid")
        .required("user.urlRequired")
        .validate(serverUrl)
        .then(() => {
          const newConfig = { ...config, base_url: serverUrl };
          // 写配置文件
          window.elecApi.writeConfig(JSON.stringify(newConfig)).then((res) => {
            if (res === true) {
              dispatch(setExtraConfig(newConfig));
              $message.success("user.setUrlSuccess");
              resolve();
            } else {
              res && $message.error(res?.toString());
              reject();
            }
          });
        })
        .catch((err: Error) => {
          // @ts-ignore
          window.e = err;
          $message.error(t(err.message));
          reject();
        });
    });
  }, [serverUrl, dispatch, t, config]);

  const handleValueChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  }, []);

  useEffect(() => {
    setUrl(config.base_url);
  }, [config.base_url]);

  return (
    <MatDialog size="xs" {...props} title="user.configServerUrl" onOk={handleOk}>
      <MatInput value={serverUrl} onChange={handleValueChange} label="user.serverUrl"></MatInput>
    </MatDialog>
  );
}
