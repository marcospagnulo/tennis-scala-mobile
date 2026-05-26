import {
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  type SvgIconProps,
  type SxProps,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {useState} from "react";
import {useDownBreakpoint} from "../hooks/useDownBreakpoint";
import type {Theme} from "@emotion/react";

type Option<T> = {
  icon?: React.ElementType<SvgIconProps>;
  label: string;
  value: T;
};

const Select = <T,>({
  options,
  placeholder,
  value,
  collapsable = false,
  disabled = false,
  variant = "outlined",
  sx,
  onChange,
}: {
  placeholder?: string;
  options: Option<T>[];
  collapsable?: boolean;
  disabled?: boolean;
  value?: T;
  variant?: "text" | "outlined" | "contained";
  sx?: SxProps<Theme>;
  onChange: (value: T) => void;
}) => {
  const isDownSm = useDownBreakpoint("sm");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);

  const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(null);
  };

  const handleViewClick = (e: React.MouseEvent<HTMLElement>, value: T) => {
    onChange(value);
    handleClose(e);
  };

  const selectedOption = options.find(option => option.value === value);
  const Icon = selectedOption?.icon;

  return (
    <>
      {collapsable && isDownSm ? (
        <IconButton sx={{...sx}} onClick={handleMenuClick} disabled={disabled}>
          {Icon && <Icon fontSize="inherit" />}
        </IconButton>
      ) : (
        <Button
          sx={{...sx}}
          startIcon={Icon && <Icon />}
          onClick={handleMenuClick}
          variant={variant}
          disabled={disabled}
          endIcon={<ArrowDropDownIcon fontSize="small" />}>
          {selectedOption?.label ?? placeholder}
        </Button>
      )}

      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{vertical: "bottom", horizontal: "center"}}
        transformOrigin={{vertical: "top", horizontal: "center"}}>
        {options.map((option, index) => {
          const Icon = option.icon;
          return (
            <MenuItem
              key={index}
              selected={option.value === value}
              onClick={e => handleViewClick(e, option.value)}>
              {Icon && (
                <ListItemIcon>
                  <Icon fontSize="inherit" />
                </ListItemIcon>
              )}
              <ListItemText>{option.label}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export {Select};
export type {Option};
