import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  Stack,
} from "@mui/material";
import { Route } from "@/types";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RouteIcon from "@mui/icons-material/Route";
import TerrainIcon from "@mui/icons-material/Terrain";
import { styled } from "@mui/material/styles";

interface RouteCardProps {
  route: Route;
  onClick: () => void;
}

const DifficultyChip = styled(Chip)(({ theme }) => ({
  fontWeight: "bold",
  "&.Easy": {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  },
  "&.Medium": {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
  },
  "&.Hard": {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
  },
}));

export default function RouteCard({ route, onClick }: RouteCardProps) {
  return (
    <Card
      sx={{
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          width: "100%",
          overflow: "hidden",
          aspectRatio: "1/1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CardMedia
          component="img"
          image={route.image_card || "/placeholder.jpg"}
          alt={route.name}
          sx={{
            width: "100%",
            height: "160%",
            objectFit: "cover",
            objectPosition: "center",
            // Fotoğrafı yukarıdan ve aşağıdan kırpılmış gibi göstermek için
            // yükseklik %120, kutu overflow:hidden
          }}
        />
      </Box>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {route.name}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <DifficultyChip
              label={route.difficulty}
              size="small"
              className={route.difficulty}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <AccessTimeIcon fontSize="small" />
              {route.duration}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <RouteIcon fontSize="small" />
              {route.distance_km} km
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <TerrainIcon fontSize="small" />
              {route.accumulated_climb_m}m
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
