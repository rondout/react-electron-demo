import * as React from "react";
import TreeItem, { TreeItemProps, useTreeItem, TreeItemContentProps } from "@mui/lab/TreeItem";
import clsx from "clsx";
import Typography from "@mui/material/Typography";
import { IconButton, Radio, Tooltip, SxProps, Box } from "@mui/material";
import Iconfont from "../../common/tools/Iconfont";
import { t } from "i18next";
import { BaseNameData } from "../../../models/base.model";

interface ContentProps {
  showRadio?: boolean;
  onAddClick?: () => void;
  onSelected?: (data: BaseNameData) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showDetailIcon?: boolean;
  operationComponents?: React.ReactNode[];
  avatarColor?: string;
  // [propName: string]: any;
  showAddButton?: boolean;
  innerSx?: SxProps;
  onDetailClick?(): void;
}

interface CustomTreeItemProps extends TreeItemProps {
  sx?: SxProps;
  checked?: boolean;
  ContentProps?: ContentProps;
  selectedchange?(event: React.ChangeEvent<HTMLInputElement>): void;
}
export default function CustomTreeItem(itemProps: CustomTreeItemProps) {
  const CustomContent = React.forwardRef((props: TreeItemContentProps, ref) => {
    // const {
    //   palette: { primary },
    // } = useTheme();
    const {
      // sx = {},
      ContentProps: { innerSx = {} },
    } = itemProps;
    const { classes, className, label, nodeId, icon: iconProp, expansionIcon, displayIcon } = props;

    const { disabled, expanded, selected, focused, handleExpansion, handleSelection, preventSelection } = useTreeItem(nodeId);

    const icon = iconProp || expansionIcon || displayIcon;

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      preventSelection(event);
    };

    const handleExpansionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      handleExpansion(event);
    };

    const handleSelectionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      handleSelection(event);
    };

    const onNodeClick = () => {
      if (itemProps.ContentProps.onSelected) {
        // @ts-ignore
        itemProps.ContentProps.onSelected({ name: props.label, id: props.nodeId });
      }
    };

    const stopPropEvent = (e: React.MouseEvent, fn: Function) => {
      e.stopPropagation();
      if (fn instanceof Function) {
        fn();
      }
    };

    // const iconColor = lighten(primary.main, 0.3);

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <Box
        className={clsx(className, classes.root, {
          [classes.expanded]: expanded,
          [classes.selected]: selected,
          [classes.focused]: focused,
          [classes.disabled]: disabled,
        })}
        onMouseDown={handleMouseDown}
        ref={ref as React.Ref<HTMLDivElement>}
        // sx={sx}
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <Box sx={innerSx} onClick={handleExpansionClick} className={classes.iconContainer}>
          {icon}
        </Box>
        <Box className="flex" style={{ flex: 1, height: "100%", marginLeft: 4, overflow: "hidden" }} onClick={onNodeClick}>
          {/* <Iconfont fontSize={32} icon="ic_menu_device1" color={iconColor}></Iconfont> */}
          {/* <Avatar sx={{ width: 35, height: 35, mr: 1, lineHeight: "35px", bgcolor: (theme) => itemProps.ContentProps.avatarColor || theme.palette.primary.main }}>{label ? label[0] : " "}</Avatar> */}
          <Typography onClick={handleSelectionClick} component="div" sx={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} className={classes.label}>
            {label}
          </Typography>
          {itemProps.ContentProps.showAddButton !== false && (
            <Tooltip title={t("device.addGroup")}>
              <IconButton onClick={(e) => stopPropEvent(e, itemProps.ContentProps.onAddClick)} className="tree-item-operation flex" size="small">
                <Iconfont mr={0} icon="ic_offline"></Iconfont>
              </IconButton>
            </Tooltip>
          )}
          {itemProps.ContentProps.onDetailClick && (
            <IconButton sx={{ ml: 0 }} onClick={(e) => stopPropEvent(e, itemProps.ContentProps.onDetailClick)} className="tree-item-operation flex" size="small">
              <Iconfont mr={0} icon="ic_look"></Iconfont>
            </IconButton>
          )}
          {itemProps.ContentProps.operationComponents?.map((detailComponent) => detailComponent)}
          {itemProps.ContentProps.showRadio && <Radio onChange={(e) => itemProps.ContentProps.onChange(e)} checked={itemProps.checked}></Radio>}
        </Box>
      </Box>
    );
  });

  return <TreeItem ContentComponent={CustomContent} {...itemProps} />;
}
