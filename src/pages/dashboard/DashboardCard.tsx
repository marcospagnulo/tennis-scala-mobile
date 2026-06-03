import {Box, Card, Stack} from "@mui/material";

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
            width: 8 * 18,
            height: "100%",
            ...(column && {
              height: 8 * 18,
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
          ...(!column && {pl: 18}),
          ...(column && {mt: 9, pt: 10}),
          flexDirection: column ? "column" : "row",
        }}>
        {content}
      </Card>
    </Stack>
  );
};
export {DashboardCard};
