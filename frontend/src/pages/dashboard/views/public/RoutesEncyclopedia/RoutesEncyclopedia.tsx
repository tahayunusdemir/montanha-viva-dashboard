import React, { useState } from "react";
import {
  Typography,
  Grid,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PageLayout from "@/pages/dashboard/components/PageLayout";
import { usePublicRoutes } from "@/services/routes";
import { Route } from "@/types";
import RouteCard from "./components/RouteCard";
import RouteDetailModal from "./components/RouteDetailModal";

export default function RoutesEncyclopedia() {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const {
    data: routes,
    isLoading,
    isError,
    error,
  } = usePublicRoutes({
    search: searchTerm,
    difficulty: difficultyFilter === "All" ? undefined : difficultyFilter,
  });

  const handleDifficultyChange = (event: SelectChangeEvent<string>) => {
    setDifficultyFilter(event.target.value);
  };

  const handleCardClick = (route: Route) => {
    setSelectedRoute(route);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRoute(null);
  };

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom>
        Discover the amazing routes of Gardunha
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Browse through the available routes, filter them by difficulty, and find
        your next adventure.
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <FormControl sx={{ minWidth: 300 }}>
          <FormLabel
            id="search-routes-label"
            sx={{
              mb: 1,
              fontWeight: 500,
              color: "text.primary",
              fontSize: "1rem",
            }}
          >
            Search
          </FormLabel>
          <TextField
            variant="outlined"
            placeholder="Search routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <FormLabel
            id="difficulty-filter-label"
            sx={{
              mb: 1,
              fontWeight: 500,
              color: "text.primary",
              fontSize: "1rem",
            }}
          >
            Filter by Difficulty
          </FormLabel>
          <Select
            aria-labelledby="difficulty-filter-label"
            value={difficultyFilter}
            onChange={handleDifficultyChange}
            displayEmpty
            sx={{ backgroundColor: "background.paper" }}
          >
            <MenuItem value="All">All Difficulties</MenuItem>
            <MenuItem value="Easy">Easy</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Hard">Hard</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
          <CircularProgress />
        </Box>
      )}
      {isError && (
        <Alert severity="error">
          Error loading routes: {error?.message || "Unknown error"}
        </Alert>
      )}

      {!isLoading && !isError && (
        <Grid container spacing={3}>
          {routes && routes.length > 0 ? (
            routes.map((route) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={route.id}>
                <RouteCard
                  route={route}
                  onClick={() => handleCardClick(route)}
                />
              </Grid>
            ))
          ) : (
            <Grid size={12}>
              <Typography sx={{ textAlign: "center", mt: 4 }}>
                No routes found.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      <RouteDetailModal
        route={selectedRoute}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </PageLayout>
  );
}
