import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  FormLabel,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import PageLayout from "@/pages/dashboard/components/PageLayout";
import floraService from "@/services/flora";
import { Plant } from "@/types";
import FloraDetailModal from "./components/FloraDetailModal";

export default function FloraEncyclopedia() {
  const [searchText, setSearchText] = useState("");
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: plants,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["plants"],
    queryFn: floraService.getPlants,
    refetchOnWindowFocus: false,
  });

  const filteredPlants = useMemo(() => {
    if (!plants) return [];
    if (!searchText) return plants;

    const lowercasedFilter = searchText.toLowerCase();
    return plants.filter(
      (plant) =>
        plant.scientific_name.toLowerCase().includes(lowercasedFilter) ||
        plant.common_names.toLowerCase().includes(lowercasedFilter)
    );
  }, [plants, searchText]);

  const handleOpenModal = (plant: Plant) => {
    setSelectedPlant(plant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlant(null);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout>
        <Alert severity="error">
          Error loading flora data: {error?.message || "An unknown error occurred."}
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Flora Encyclopedia
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Explore the rich biodiversity of the region. Click on any plant to discover its details, uses, and interactions with fauna.
        </Typography>
        <FormControl fullWidth variant="outlined">
          <FormLabel htmlFor="search-input">Search Plants</FormLabel>
          <OutlinedInput
            id="search-input"
            placeholder="Search by scientific or common name..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            label="Search Plants"
          />
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        {filteredPlants.map((plant) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={plant.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea onClick={() => handleOpenModal(plant)} sx={{ flexGrow: 1 }}>
                <CardMedia
                  component="img"
                  height="250"
                  image={plant.images?.[0]?.image || "/placeholder.png"} // Use a placeholder if no image
                  alt={plant.scientific_name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div" noWrap>
                    {plant.scientific_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {plant.common_names}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredPlants.length === 0 && !isLoading && (
        <Box mt={4} textAlign="center">
            <Typography>No plants found matching your search.</Typography>
        </Box>
      )}

      <FloraDetailModal
        open={isModalOpen}
        onClose={handleCloseModal}
        plant={selectedPlant}
      />
    </PageLayout>
  );
}
