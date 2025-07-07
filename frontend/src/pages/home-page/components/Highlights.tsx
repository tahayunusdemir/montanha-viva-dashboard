import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";

const items = [
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: "Data-Driven Sustainability",
    description:
      "Our platform uses real-time IoT data to promote environmental preservation and support sustainable practices in agriculture and tourism.",
  },
  {
    icon: <ConstructionRoundedIcon />,
    title: "Economic Empowerment",
    description:
      "By providing valuable data and promoting local biodiversity, we aim to support local businesses and create new opportunities in the region.",
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: "Engaging Ecotourism",
    description:
      "Enhance your visit to the Serra da Gardunha with interactive trails and a rich, accessible database of local flora.",
  },
  {
    icon: <AutoFixHighRoundedIcon />,
    title: "Innovative Technology",
    description:
      "Leveraging IoT, data visualization, and mobile interactivity to create a unique connection between people and the environment.",
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: "Community-Focused",
    description:
      "Developed in collaboration with local partners to ensure our solutions meet the real-world needs of the community.",
  },
  {
    icon: <QueryStatsRoundedIcon />,
    title: "Scientific Research Hub",
    description:
      "A valuable resource for researchers and students, providing rich data for studies on biodiversity, ecology, and sustainability.",
  },
];

export default function Highlights() {
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: "white",
        bgcolor: "grey.900",
        scrollMarginTop: "80px",
      }}
    >
      <Container
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: "100%", md: "60%" },
            textAlign: { sm: "left", md: "center" },
          }}
        >
          <Typography component="h2" variant="h4" gutterBottom>
            Highlights
          </Typography>
          <Typography variant="body1" sx={{ color: "grey.400" }}>
            From empowering local communities with data to creating
            unforgettable ecotourism experiences, discover the core benefits
            that make Montanha Viva a landmark project for sustainable
            development.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Stack
                direction="column"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  color: "inherit",
                  p: 3,
                  height: "100%",
                  borderColor: "hsla(220, 25%, 25%, 0.3)",
                  backgroundColor: "grey.800",
                }}
              >
                <Box sx={{ opacity: "50%" }}>{item.icon}</Box>
                <div>
                  <Typography gutterBottom sx={{ fontWeight: "medium" }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "grey.400" }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
