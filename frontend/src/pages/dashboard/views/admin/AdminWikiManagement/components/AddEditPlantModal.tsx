import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  Box,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Delete as DeleteIcon,
  BugReport as BugReportIcon,
  Restaurant as RestaurantIcon,
  LocalHospital as LocalHospitalIcon,
  Yard as YardIcon,
  MenuBook as MenuBookIcon,
  Air as AirIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

import floraService from "@/services/flora";
import { Plant, PlantPayload, PlantImage } from "@/types";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const useFlags = [
  { id: "food", label: "Food", icon: <RestaurantIcon /> },
  { id: "medicinal", label: "Medicinal", icon: <LocalHospitalIcon /> },
  { id: "ornamental", label: "Ornamental", icon: <YardIcon /> },
  { id: "traditional", label: "Traditional", icon: <MenuBookIcon /> },
  { id: "aromatic", label: "Aromatic", icon: <AirIcon /> },
  {
    id: "fauna_interaction",
    label: "Fauna Interaction",
    icon: <BugReportIcon />,
  },
];

// Example data for demonstration
const exampleData = {
  scientific_name: "Rosa canina L.",
  common_names: "Dog Rose, Wild Rose, Briar Rose, English Rose",
  interaction_fauna:
    "Bees and butterflies are attracted to the flowers for nectar. Birds feed on the rose hips during winter months. The plant provides shelter for small insects and nesting material for birds.",
  food_uses:
    "Rose hips are rich in vitamin C and can be used to make tea, jam, and syrup. Petals can be used in salads and desserts.",
  medicinal_uses:
    "Rose hips are used for their high vitamin C content and antioxidant properties. Rose water is used in traditional medicine for skin conditions.",
  ornamental_uses:
    "Widely used in gardens and parks for its beautiful flowers and climbing habit. Popular in rose gardens and as a hedge plant.",
  traditional_uses:
    "Used in traditional medicine for digestive issues and skin problems. Rose water has been used in Middle Eastern cultures for centuries.",
  aromatic_uses:
    "Rose petals and rose water are used in perfumery and aromatherapy. Essential oil is extracted for use in cosmetics and fragrances.",
};

interface AddEditPlantModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PlantPayload) => void;
  plant: Plant | null;
}

export default function AddEditPlantModal({
  open,
  onClose,
  onSubmit,
  plant,
}: AddEditPlantModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PlantPayload>();

  const isEditMode = plant !== null;
  const [images, setImages] = useState<PlantImage[]>([]);

  const uploadMutation = useMutation({
    mutationFn: floraService.uploadPlantImage,
    onSuccess: (data) => {
      setImages((prev) => [...prev, { id: data.id, image: data.image }]);
    },
    onError: (error) => {
      console.error("Image upload failed:", error);
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && plant) {
        reset({
          scientific_name: plant.scientific_name,
          common_names: plant.common_names,
          interaction_fauna: plant.interaction_fauna,
          food_uses: plant.food_uses,
          medicinal_uses: plant.medicinal_uses,
          ornamental_uses: plant.ornamental_uses,
          traditional_uses: plant.traditional_uses,
          aromatic_uses: plant.aromatic_uses,
        });
        setImages(plant.images || []);
      } else {
        reset({
          scientific_name: "",
          common_names: "",
          interaction_fauna: "",
          food_uses: "",
          medicinal_uses: "",
          ornamental_uses: "",
          traditional_uses: "",
          aromatic_uses: "",
        });
        setImages([]);
      }
    }
  }, [open, plant, isEditMode, reset]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append("image", file);
      uploadMutation.mutate(formData);
    }
  };

  const handleRemoveImage = (id: number) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleFormSubmit: SubmitHandler<PlantPayload> = (data) => {
    const payload = {
      ...data,
      uploaded_image_ids: images.map((img) => img.id),
    };
    onSubmit(payload);
  };

  const watchedValues = watch([
    "food_uses",
    "medicinal_uses",
    "ornamental_uses",
    "traditional_uses",
    "aromatic_uses",
    "interaction_fauna",
  ]);

  const uses = {
    food: !!watchedValues[0],
    medicinal: !!watchedValues[1],
    ornamental: !!watchedValues[2],
    traditional: !!watchedValues[3],
    aromatic: !!watchedValues[4],
    fauna_interaction: !!watchedValues[5],
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditMode ? "Edit Plant" : "Add New Plant"}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {/* Text Fields */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <FormLabel>Scientific Name (Latin)</FormLabel>
                <Controller
                  name="scientific_name"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Scientific name is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="e.g., Rosa canina L., Quercus robur L., Lavandula angustifolia"
                      error={!!errors.scientific_name}
                      helperText={
                        errors.scientific_name?.message ||
                        "Enter the Latin scientific name with author abbreviation (e.g., L. for Linnaeus, Mill. for Miller)"
                      }
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <FormLabel>Common Names (comma-separated)</FormLabel>
                <Controller
                  name="common_names"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Common names are required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="e.g., Dog Rose, Wild Rose, Briar Rose"
                      error={!!errors.common_names}
                      helperText={
                        errors.common_names?.message ||
                        "Enter common names separated by commas"
                      }
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <FormLabel>Fauna Interaction</FormLabel>
                <Controller
                  name="interaction_fauna"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Fauna interaction is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      multiline
                      rows={2}
                      fullWidth
                      placeholder="e.g., Birds feed on rose hips during winter. Bees and butterflies pollinate the flowers. Deer browse on young shoots."
                      error={!!errors.interaction_fauna}
                      helperText={
                        errors.interaction_fauna?.message ||
                        "Describe how animals interact with this plant (pollination, feeding, shelter, etc.)"
                      }
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Optional Use TextFields */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <FormLabel>Food Uses</FormLabel>
                <Controller
                  name="food_uses"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="e.g., Rose hips used to make tea and jam. Petals used in salads and desserts."
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <FormLabel>Medicinal Uses</FormLabel>
                <Controller
                  name="medicinal_uses"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="e.g., Rose hip tea rich in vitamin C. Petals used for skin conditions."
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <FormLabel>Ornamental Uses</FormLabel>
                <Controller
                  name="ornamental_uses"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="e.g., Popular garden plant for hedges and borders. Used in cut flower arrangements."
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <FormLabel>Traditional Uses</FormLabel>
                <Controller
                  name="traditional_uses"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="e.g., Used in traditional medicine for digestive issues. Symbol of love in many cultures."
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <FormLabel>Aromatic Uses</FormLabel>
                <Controller
                  name="aromatic_uses"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="e.g., Essential oil used in perfumes and cosmetics. Rose water for skin care."
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Use Flags */}
            <Grid size={{ xs: 12 }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 1 }}>
                  Use Indicators
                </FormLabel>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {useFlags.map((flag) => (
                    <Chip
                      key={flag.id}
                      icon={flag.icon}
                      label={flag.label}
                      color={
                        uses[flag.id as keyof typeof uses]
                          ? "primary"
                          : "default"
                      }
                      variant={
                        uses[flag.id as keyof typeof uses]
                          ? "filled"
                          : "outlined"
                      }
                    />
                  ))}
                </Box>
              </FormControl>
            </Grid>

            {/* Image Upload */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <FormLabel>Images</FormLabel>
                <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
                  {images.map((image) => (
                    <Box key={image.id} position="relative">
                      <img
                        src={image.image}
                        alt="plant"
                        width="100"
                        height="100"
                        style={{ objectFit: "cover", borderRadius: "8px" }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(image.id)}
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={
                      uploadMutation.isPending ? (
                        <CircularProgress size={20} />
                      ) : (
                        <AddPhotoAlternateIcon />
                      )
                    }
                    sx={{ height: 100, width: 100 }}
                    disabled={uploadMutation.isPending}
                  >
                    Upload
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Button>
                </Box>
                {uploadMutation.isError && (
                  <Typography color="error" variant="caption">
                    Image upload failed. Please try again.
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEditMode ? "Save Changes" : "Create Plant"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
