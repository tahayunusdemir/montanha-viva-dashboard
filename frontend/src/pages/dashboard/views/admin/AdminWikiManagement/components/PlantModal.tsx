import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Stack,
} from "@mui/material";
import { Plant } from "@/types/flora";

interface PlantModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PlantFormData) => void;
  plant: Plant | null;
  isLoading: boolean;
}

// This is the data structure for the backend (and what onSubmit will receive)
export type PlantFormData = Omit<Plant, "id" | "created_at" | "updated_at">;

// This type represents the shape of the form data inside react-hook-form,
// where 'images' is a single comma-separated string for easier editing in a TextField.
type PlantFormShape = Omit<PlantFormData, "images"> & {
  images: string;
};

const useFlags = [
  { key: "insects", label: "Insects" },
  { key: "decorative", label: "Decorative" },
  { key: "medicinal", label: "Medicinal" },
  { key: "food", label: "Food" },
  { key: "aromatic", label: "Aromatic" },
  { key: "birds", label: "Birds" },
];

export default function PlantModal({
  open,
  onClose,
  onSubmit,
  plant,
  isLoading,
}: PlantModalProps) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PlantFormShape>();

  React.useEffect(() => {
    if (plant) {
      reset({
        ...plant,
        images: plant.images.join(", "), // Convert array to comma-separated string
      });
    } else {
      reset({
        scientific_name: "",
        common_names: "",
        images: "",
        interaction_fauna: "",
        food_uses: "",
        medicinal_uses: "",
        ornamental_uses: "",
        traditional_uses: "",
        aromatic_uses: "",
        uses_flags: {},
      });
    }
  }, [plant, reset]);

  const handleFormSubmit = (data: PlantFormShape) => {
    const processedData: PlantFormData = {
      ...data,
      images: data.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean), // Convert string back to array of strings
    };
    onSubmit(processedData);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          {plant ? "Edit Plant" : "Create New Plant"}
        </Typography>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="scientific_name"
                control={control}
                defaultValue=""
                rules={{ required: "Scientific name is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Scientific Name"
                    variant="outlined"
                    fullWidth
                    error={!!errors.scientific_name}
                    helperText={errors.scientific_name?.message}
                  />
                )}
              />
              <Controller
                name="common_names"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Common Names"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </Stack>

            <Controller
              name="images"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Image Paths (comma-separated)"
                  variant="outlined"
                  fullWidth
                  helperText="Enter paths to images, separated by commas."
                />
              )}
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Uses Flags
              </Typography>
              <FormGroup row>
                {useFlags.map((flag) => (
                  <Controller
                    key={flag.key}
                    name={`uses_flags.${flag.key}`}
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox {...field} checked={!!field.value} />
                        }
                        label={flag.label}
                      />
                    )}
                  />
                ))}
              </FormGroup>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="interaction_fauna"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Interaction with Fauna"
                    multiline
                    rows={4}
                    fullWidth
                  />
                )}
              />
              <Controller
                name="food_uses"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Food Uses"
                    multiline
                    rows={4}
                    fullWidth
                  />
                )}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="medicinal_uses"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Medicinal Uses"
                    multiline
                    rows={4}
                    fullWidth
                  />
                )}
              />
              <Controller
                name="ornamental_uses"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ornamental Uses"
                    multiline
                    rows={4}
                    fullWidth
                  />
                )}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="traditional_uses"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Traditional Uses"
                    multiline
                    rows={4}
                    fullWidth
                  />
                )}
              />
              <Controller
                name="aromatic_uses"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Aromatic Uses"
                    multiline
                    rows={4}
                    fullWidth
                  />
                )}
              />
            </Stack>
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 3, justifyContent: "flex-end" }}
          >
            <Button onClick={onClose} color="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : "Save"}
            </Button>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
}
