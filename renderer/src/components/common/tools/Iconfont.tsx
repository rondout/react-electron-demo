import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CSSProperties, MouseEvent } from "react";

interface IconfontProps {
  icon: string;
  fontSize?: number;
  color?: string;
  mr?: number;
  my?: number;
  onClick?(ev: MouseEvent): any;
  pointer?: boolean;
  style?: CSSProperties;
  primary?: boolean;
  className?: string;
}

const useStyles = makeStyles((theme: Theme) => {
  return {
    icon: {
      color: theme.palette.primary.main,
    },
    greyIcon: {
      // color: theme.palette.action.disabled,
    },
  };
});

export default function Iconfont(props: IconfontProps) {
  const classes = useStyles();
  const onClick = props.onClick || (() => {});
  const { icon, fontSize = 24, mr = 1, color, my = 0, style = {}, primary } = props;

  const className = primary ? classes.icon : classes.greyIcon;

  const computedClassName = props.className ? className + " " + props.className + "iconfont icon-" + icon : className + " iconfont icon-" + icon;
  return (
    // <i
    //   onClick={onClick}
    //   className={computedClassName}
    //   style={{ fontSize, marginRight: mr * 8, marginTop: my * 8, marginBottom: my * 8, color, cursor: props.pointer ? "pointer" : null, height: fontSize, lineHeight: 1, ...style }}
    // ></i>
    <svg
      onClick={onClick}
      style={{
        fontSize,
        marginRight: mr * 8,
        marginTop: my * 8,
        marginBottom: my * 8,
        color,
        cursor: props.pointer ? "pointer" : null,
        height: fontSize,
        width: fontSize,
        lineHeight: 1,
        ...style,
      }}
      className={computedClassName}
      aria-hidden="true"
    >
      <use xlinkHref={"#icon-" + icon}></use>
    </svg>
  );
}
