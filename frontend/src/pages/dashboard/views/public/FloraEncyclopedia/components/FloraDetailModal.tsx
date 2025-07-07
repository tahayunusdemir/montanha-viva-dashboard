import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Chip,
  Paper,
  IconButton,
  FormControl,
  FormLabel,
} from "@mui/material";
import {
  BugReport as BugReportIcon,
  Restaurant as RestaurantIcon,
  LocalHospital as LocalHospitalIcon,
  Yard as YardIcon,
  MenuBook as MenuBookIcon,
  Air as AirIcon,
  ArrowBackIosNew as ArrowBackIosNewIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
} from "@mui/icons-material";
import { Plant } from "@/types";

const useFlags = [
  { id: "food", label: "Food", icon: <RestaurantIcon fontSize="small" /> },
  {
    id: "medicinal",
    label: "Medicinal",
    icon: <LocalHospitalIcon fontSize="small" />,
  },
  {
    id: "ornamental",
    label: "Ornamental",
    icon: <YardIcon fontSize="small" />,
  },
  {
    id: "traditional",
    label: "Traditional",
    icon: <MenuBookIcon fontSize="small" />,
  },
  { id: "aromatic", label: "Aromatic", icon: <AirIcon fontSize="small" /> },
  {
    id: "fauna_interaction",
    label: "Fauna Interaction",
    icon: <BugReportIcon fontSize="small" />,
  },
];

interface FloraDetailModalProps {
  open: boolean;
  onClose: () => void;
  plant: Plant | null;
}

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <FormControl fullWidth sx={{ mb: 2 }}>
    <FormLabel sx={{ color: "text.secondary", fontSize: "0.75rem", mb: 1 }}>
      {label}
    </FormLabel>
    <Typography variant="body1" component="div">
      {value || "N/A"}
    </Typography>
  </FormControl>
);

export default function FloraDetailModal({
  open,
  onClose,
  plant,
}: FloraDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setSelectedImageIndex(0);
    }
  }, [open]);

  if (!plant) {
    return null;
  }

  const activeUseFlags = useFlags.filter(
    (flag) => plant.uses && plant.uses[flag.id],
  );

  const handleNextImage = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % plant.images.length);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + plant.images.length) % plant.images.length,
    );
  };

  const hasImages = plant.images && plant.images.length > 0;
  const showNavigation = hasImages && plant.images.length > 1;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{plant.scientific_name}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ pt: 1 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            {hasImages ? (
              <Box>
                <Box sx={{ position: "relative", mb: 1 }}>
                  <Paper variant="outlined">
                    <Box
                      component="img"
                      src={plant.images[selectedImageIndex].image}
                      alt={`${plant.scientific_name} - ${selectedImageIndex + 1}`}
                      sx={{
                        width: "100%",
                        height: "300px",
                        objectFit: "cover",
                        borderRadius: 1,
                      }}
                    />
                  </Paper>
                  {showNavigation && (
                    <>
                      <IconButton
                        onClick={handlePrevImage}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: 8,
                          transform: "translateY(-50%)",
                          color: "white",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                        }}
                      >
                        <ArrowBackIosNewIcon />
                      </IconButton>
                      <IconButton
                        onClick={handleNextImage}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          right: 8,
                          transform: "translateY(-50%)",
                          color: "white",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                        }}
                      >
                        <ArrowForwardIosIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
                <Box sx={{ display: "flex", overflowX: "auto", gap: 1, pb: 1 }}>
                  {plant.images.map((image, index) => (
                    <Box
                      key={image.id}
                      component="img"
                      src={image.image}
                      alt={`thumbnail ${index + 1}`}
                      onClick={() => setSelectedImageIndex(index)}
                      sx={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: 1,
                        cursor: "pointer",
                        border:
                          selectedImageIndex === index
                            ? "2px solid"
                            : "2px solid transparent",
                        borderColor:
                          selectedImageIndex === index
                            ? "primary.main"
                            : "transparent",
                        transition: "border-color 0.3s",
                      }}
                    />
                  ))}
                </Box>
              </Box>
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "grey.100",
                }}
              >
                <Typography>No Image Available</Typography>
              </Paper>
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <DetailItem label="Common Names" value={plant.common_names} />
            <DetailItem
              label="Fauna Interaction"
              value={plant.interaction_fauna}
            />

            {activeUseFlags.length > 0 && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <FormLabel
                  sx={{ color: "text.secondary", fontSize: "0.75rem", mb: 1 }}
                >
                  Uses
                </FormLabel>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {activeUseFlags.map((flag) => (
                    <Chip
                      key={flag.id}
                      icon={flag.icon}
                      label={flag.label}
                      size="small"
                    />
                  ))}
                </Box>
              </FormControl>
            )}

            {plant.food_uses && (
              <DetailItem label="Food Uses" value={plant.food_uses} />
            )}
            {plant.medicinal_uses && (
              <DetailItem label="Medicinal Uses" value={plant.medicinal_uses} />
            )}
            {plant.ornamental_uses && (
              <DetailItem
                label="Ornamental Uses"
                value={plant.ornamental_uses}
              />
            )}
            {plant.traditional_uses && (
              <DetailItem
                label="Traditional Uses"
                value={plant.traditional_uses}
              />
            )}
            {plant.aromatic_uses && (
              <DetailItem label="Aromatic Uses" value={plant.aromatic_uses} />
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
