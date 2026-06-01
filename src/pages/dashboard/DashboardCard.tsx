import {Box, Card, Stack} from "@mui/material";
import {useAppContext} from "../../app/context";

const DashboardCard = ({
  image,
  content,
}: {
  image: React.ReactNode | string;
  content: React.ReactNode;
}) => {
  const {mobile} = useAppContext();

  return (
    <Stack
      sx={{
        position: "relative",
        mt: mobile ? 2 : 0,
        borderRadius: 2,
        m: "2px",
        p: "2px",
        overflow: "hidden",
      }}>
      <Stack
        sx={{
          position: "absolute",
          ...(!mobile && {
            height: "calc(100% - 4px)",
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
            overflow: "hidden",
          }),
          ...(mobile && {
            width: "100%",
          }),
        }}>
        <Box
          sx={{
            width: 8 * 22,
            height: "100%",
            ...(mobile && {
              height: 8 * 22,
              top: 0,
              bottom: 0,
              borderRadius: "50%",
              margin: "0 auto",
              overflow: "hidden",
            }),
          }}>
          {image}
        </Box>
      </Stack>
      <Card
        sx={{
          display: "flex",
          ...(!mobile && {pl: 22}),
          ...(mobile && {mt: 11, pt: 9}),
          flexDirection: mobile ? "column" : "row",
        }}>
        {content}
      </Card>
    </Stack>
  );
};
export {DashboardCard};
