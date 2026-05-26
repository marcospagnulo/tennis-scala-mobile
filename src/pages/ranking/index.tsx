import type {Theme} from "@emotion/react";
import {type SxProps} from "@mui/material";
import {Stack} from "@mui/system";
import {useQueryCollection} from "../../hooks/useQueryCollection";
import {collections} from "../../lib/firebase";

const RankingPage = ({sx}: {sx?: SxProps<Theme>}) => {
  const {items} = useQueryCollection({collection: collections?.ranking});

  return <Stack sx={{...sx}}></Stack>;
};

export {RankingPage};
