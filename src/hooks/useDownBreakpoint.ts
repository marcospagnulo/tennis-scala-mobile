import {useMediaQuery, useTheme, type Breakpoint} from "@mui/material";

const useDownBreakpoint = (breakpoint: number | Breakpoint) => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down(breakpoint));
};

export {useDownBreakpoint};
