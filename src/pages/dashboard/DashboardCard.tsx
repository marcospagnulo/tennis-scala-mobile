import {Box, Card, Stack} from "@mui/material";
import {useAppContext} from "../../app/context";

const DashboardCard = ({
  image,
  content,
  direction = "row",
}: {
  image: React.ReactNode | string;
  content: React.ReactNode;
  direction?: "row" | "column";
}) => {
  const column = direction === "column";
  const {mobile} = useAppContext();

  const circleSize = mobile ? 10 : 12;

  return (
    <Stack
      sx={{
        position: "relative",
        mt: column ? 2 : 0,
        borderRadius: 2,
        m: "2px",
        p: "2px",
        overflow: "hidden",
      }}>
      <Stack
        sx={{
          position: "absolute",
          ...(!column && {
            height: "calc(100% - 4px)",
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
            overflow: "hidden",
          }),
          ...(column && {
            width: "100%",
          }),
        }}>
        <Box
          sx={{
            width: 8 * circleSize,
            height: "100%",
            ...(column && {
              height: 8 * circleSize,
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
          flex: 1,
          ...(!column && {pl: circleSize}),
          ...(column && {mt: circleSize / 2, pt: circleSize / 2 + 1}),
          flexDirection: column ? "column" : "row",
        }}>
        {content}
      </Card>
    </Stack>
  );
};
export {DashboardCard};
