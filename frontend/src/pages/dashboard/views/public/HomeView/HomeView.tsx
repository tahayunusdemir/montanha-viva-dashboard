import * as React from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

// Icons
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import RouteIcon from "@mui/icons-material/Route";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import StarIcon from "@mui/icons-material/Star";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import SensorsIcon from "@mui/icons-material/Sensors";
import FeedbackIcon from "@mui/icons-material/Feedback";
import InfoIcon from "@mui/icons-material/Info";

import PageLayout from "@/pages/dashboard/components/PageLayout";
import { useAuthStore } from "@/store/authStore";

const features = [
  {
    title: "Profile Management",
    description: "Update your personal details and manage account settings.",
    icon: <AccountCircleIcon color="primary" sx={{ fontSize: 48 }} />,
    path: "/dashboard/profile",
  },
  {
    title: "Routes Encyclopedia",
    description:
      "Discover hiking trails, view maps, and find your next adventure.",
    icon: <RouteIcon color="primary" sx={{ fontSize: 48 }} />,
    path: "/dashboard/routes-encyclopedia",
  },
  {
    title: "Flora Encyclopedia",
    description:
      "Explore the rich biodiversity and learn about local plant species.",
    icon: <LocalFloristIcon color="primary" sx={{ fontSize: 48 }} />,
    path: "/dashboard/flora-encyclopedia",
  },
  {
    title: "Scan QR Codes",
    description:
      "Scan codes along the trails to earn points and engage with nature.",
    icon: <QrCodeScannerIcon color="primary" sx={{ fontSize: 48 }} />,
    path: "/dashboard/qr-codes",
  },
  {
    title: "Points & Rewards",
    description: "Track your points, view scan history, and redeem rewards.",
    icon: <StarIcon color="primary" sx={{ fontSize: 48 }} />,
    path: "/dashboard/points-and-rewards",
  },
  {
    title: "Plant Identifier",
    description:
      "Use your camera to identify plants you encounter on your journey.",
    icon: <ImageSearchIcon color="primary" sx={{ fontSize: 48 }} />,
    path: "/dashboard/plant-identifier",
  },
  {
    title: "Sensor Data",
    description: "Analyze real-time and historical data from IoT sensors.",
    icon: <SensorsIcon color="primary" sx={{ fontSize: 48 }} />,
    path: "/dashboard/sensor-data",
  },
  {
    title: "Send Feedback",
    description: "Share your thoughts, report issues, or suggest new features.",
    icon: <FeedbackIcon color="primary" sx={{ fontSize: 48 }} />,
    path: "/dashboard/send-feedback",
  },
  {
    title: "About the Project",
    description: "Learn more about the Montanha Viva initiative and its goals.",
    icon: <InfoIcon color="primary" sx={{ fontSize: 48 }} />,
    path: "/dashboard/about",
  },
];

const FeatureCard = ({
  title,
  description,
  icon,
  path,
}: (typeof features)[0]) => {
  const theme = useTheme();
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows[6],
          },
        }}
      >
        <CardActionArea
          component={RouterLink}
          to={path}
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}
        >
          <Box sx={{ mb: 2, color: "primary.main" }}>{icon}</Box>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography gutterBottom variant="h6" component="div">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
};

export default function HomeView() {
  const user = useAuthStore((state) => state.user);

  return (
    <PageLayout>
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user?.first_name || "Explorer"}!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          What would you like to do today?
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </Grid>
    </PageLayout>
  );
}
