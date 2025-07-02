import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import RouteIcon from "@mui/icons-material/Route";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TerrainIcon from "@mui/icons-material/Terrain";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import LandscapeIcon from "@mui/icons-material/Landscape";
import PetsIcon from "@mui/icons-material/Pets";
import PlaceIcon from "@mui/icons-material/Place";
import { Route } from "@/types";

interface RouteDetailModalProps {
  route: Route | null;
  open: boolean;
  onClose: () => void;
}

const DetailItem = ({
  icon,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  primary: string;
  secondary: string | number;
}) => (
  <Grid size={{ xs: 12, sm: 6 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      {icon}
      <Box>
        <Typography variant="body2" color="text.secondary">
          {primary}
        </Typography>
        <Typography variant="subtitle2">{secondary}</Typography>
      </Box>
    </Box>
  </Grid>
);

export default function RouteDetailModal({
  route,
  open,
  onClose,
}: RouteDetailModalProps) {
  if (!route) return null;

  const handleDownloadGpx = () => {
    if (route.gpx_file) {
      window.open(route.gpx_file, "_blank");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {route.name}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Box
              component="img"
              src={route.image_map || "/placeholder.jpg"}
              alt={`${route.name} map`}
              sx={{
                width: "100%",
                borderRadius: 1,
                objectFit: "cover",
                aspectRatio: "16/9",
                maxHeight: "500px"
              }}
            />
          </Grid>
          <Grid size={12}>
            <Typography variant="body1">{route.description}</Typography>
          </Grid>

          <Grid size={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" gutterBottom>
              Route Details
            </Typography>
            <Grid container spacing={2}>
              <DetailItem
                icon={<RouteIcon />}
                primary="Distance"
                secondary={`${route.distance_km} km`}
              />
              <DetailItem
                icon={<AccessTimeIcon />}
                primary="Duration"
                secondary={route.duration}
              />
              <DetailItem
                icon={<TerrainIcon />}
                primary="Difficulty"
                secondary={route.difficulty}
              />
              <DetailItem
                icon={<LandscapeIcon />}
                primary="Altitude (min/max)"
                secondary={`${route.altitude_min_m}m / ${route.altitude_max_m}m`}
              />
              <DetailItem
                icon={<GpsFixedIcon />}
                primary="Route Type"
                secondary={route.route_type}
              />
               <DetailItem
                icon={<PetsIcon />}
                primary="Fauna Interaction"
                secondary={route.interaction_fauna}
              />
            </Grid>
          </Grid>

          {route.points_of_interest.length > 0 && (
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" gutterBottom>
                Points of Interest
              </Typography>
              <List dense>
                {route.points_of_interest.map((poi) => (
                  <ListItem key={poi.id}>
                    <ListItemIcon>
                      <PlaceIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={poi.name}
                      secondary={poi.description}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadGpx}
          disabled={!route.gpx_file}
        >
          Download GPX
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
