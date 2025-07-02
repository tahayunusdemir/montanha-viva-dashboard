import React from "react";
import {
  Typography,
  Box,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
} from "@mui/material";
import RouteIcon from "@mui/icons-material/Route";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TerrainIcon from "@mui/icons-material/Terrain";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import LandscapeIcon from "@mui/icons-material/Landscape";
import PetsIcon from "@mui/icons-material/Pets";
import PlaceIcon from "@mui/icons-material/Place";
import InfoIcon from "@mui/icons-material/Info";
import { Route } from "@/types";

interface ViewRouteDetailsProps {
  route: Route;
}

const DetailItem = ({
  icon,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  primary: string;
  secondary: string | number | undefined;
}) => (
  <Grid size={{ xs: 12, md: 6 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1 }}>
      {icon}
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {primary}
        </Typography>
        <Typography variant="subtitle2" component="div">
          {secondary || "N/A"}
        </Typography>
      </Box>
    </Box>
  </Grid>
);

export default function ViewRouteDetails({ route }: ViewRouteDetailsProps) {
  const pointsOfInterestArray =
    typeof route.points_of_interest === "string" && route.points_of_interest
      ? route.points_of_interest.split(",").map((poi, index) => ({
          id: index,
          name: poi.trim(),
          description: "",
        }))
      : [];

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {route.name}
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            component="img"
            src={route.image_card || "/placeholder.jpg"}
            alt={`${route.name} card image`}
            sx={{
              width: "100%",
              borderRadius: 1,
              mb: 1,
              maxHeight: 200,
              objectFit: "cover",
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            component="img"
            src={route.image_map || "/placeholder.jpg"}
            alt={`${route.name} map image`}
            sx={{
              width: "100%",
              borderRadius: 1,
              mb: 1,
              maxHeight: 200,
              objectFit: "cover",
            }}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">Description</Typography>
      <Typography variant="body1" paragraph>
        {route.description}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Route Details
      </Typography>
      <Grid container spacing={1}>
        <DetailItem
          icon={<RouteIcon color="action" />}
          primary="Distance"
          secondary={`${route.distance_km} km`}
        />
        <DetailItem
          icon={<AccessTimeIcon color="action" />}
          primary="Duration"
          secondary={route.duration}
        />
        <DetailItem
          icon={<TerrainIcon color="action" />}
          primary="Difficulty"
          secondary={route.difficulty}
        />
        <DetailItem
          icon={<LandscapeIcon color="action" />}
          primary="Altitude (min/max)"
          secondary={`${route.altitude_min_m}m / ${route.altitude_max_m}m`}
        />
        <DetailItem
          icon={<GpsFixedIcon color="action" />}
          primary="Route Type"
          secondary={route.route_type}
        />
        <DetailItem
          icon={<InfoIcon color="action" />}
          primary="Start GPS"
          secondary={route.start_point_gps}
        />
        <DetailItem
          icon={<InfoIcon color="action" />}
          primary="GPX File"
          secondary={route.gpx_file}
        />
      </Grid>

      {pointsOfInterestArray.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Points of Interest
          </Typography>
          <List dense>
            {pointsOfInterestArray.map((poi) => (
              <ListItem key={poi.id}>
                <ListItemIcon>
                  <PlaceIcon />
                </ListItemIcon>
                <ListItemText primary={poi.name} secondary={poi.description} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
}
