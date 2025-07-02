import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Chip,
  Box,
  Typography,
  FormHelperText,
  styled,
} from "@mui/material";
import { useForm, Controller, SubmitHandler, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Route, RoutePayload, PointOfInterest } from "@/types";
import {
  useCreateRoute,
  useUpdateRoute,
  usePointsOfInterest,
} from "@/services/routes";
import { CloudUpload, InsertDriveFile, CheckCircle } from "@mui/icons-material";

// Schema definition
const fileSchema = z
  .instanceof(FileList)
  .refine((files) => files && files.length > 0, "File is required.");

const routeSchema = (isEditing: boolean) =>
  z.object({
    name: z.string().min(1, "Name is required"),
    distance_km: z.coerce
      .number()
      .positive("Distance must be a positive number"),
    duration: z.string().min(1, "Duration is required"),
    route_type: z.enum(["circular", "linear"]),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    altitude_min_m: z.coerce.number().int("Min altitude must be an integer"),
    altitude_max_m: z.coerce.number().int("Max altitude must be an integer"),
    accumulated_climb_m: z.coerce
      .number()
      .nonnegative("Accumulated climb must be an integer"),
    start_point_gps: z.string().min(1, "Start point GPS is required"),
    description: z.string().min(1, "Description is required"),
    interaction_fauna: z.string().optional(),
    points_of_interest_ids: z.array(z.number()).optional(),
    image_card: isEditing ? z.instanceof(FileList).optional() : fileSchema,
    image_map: isEditing ? z.instanceof(FileList).optional() : fileSchema,
    gpx_file: isEditing ? z.instanceof(FileList).optional() : fileSchema,
  });

type RouteFormValues = z.infer<ReturnType<typeof routeSchema>>;

// Props interface
interface AddEditRouteModalProps {
  open: boolean;
  onClose: () => void;
  route?: Route;
}

// Styled components
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

// FileInput component
const FileInput = ({
  control,
  name,
  label,
  existingFileUrl,
  accept,
  error,
}: {
  control: any;
  name: "image_card" | "image_map" | "gpx_file";
  label: string;
  existingFileUrl?: string | null;
  accept: string;
  error?: { message?: string };
}) => {
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (existingFileUrl) {
      setFileName(existingFileUrl.split("/").pop() || "Existing File");
    } else {
      setFileName(null);
    }
  }, [existingFileUrl]);

  return (
    <FormControl fullWidth error={!!error}>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUpload />}
              sx={{ width: "100%", justifyContent: "flex-start", py: 1.5 }}
            >
              {label}
              <VisuallyHiddenInput
                type="file"
                accept={accept}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    onChange(files);
                    setFileName(files[0].name);
                  }
                }}
              />
            </Button>
            {fileName && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: 1,
                  color: "text.secondary",
                }}
              >
                {value?.[0] ? (
                  <CheckCircle
                    color="success"
                    sx={{ mr: 1, fontSize: "1rem" }}
                  />
                ) : (
                  <InsertDriveFile sx={{ mr: 1, fontSize: "1rem" }} />
                )}
                <Typography variant="caption" sx={{ fontStyle: "italic" }}>
                  {fileName}
                </Typography>
              </Box>
            )}
          </>
        )}
      />
      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  );
};

// Main component
export default function AddEditRouteModal({
  open,
  onClose,
  route,
}: AddEditRouteModalProps) {
  const isEditing = !!route;
  const { data: pointsOfInterest = [], isLoading: poisLoading } =
    usePointsOfInterest();

  const defaultValues: Partial<RouteFormValues> = {
    name: "",
    distance_km: 0,
    duration: "",
    route_type: "circular",
    difficulty: "Medium",
    altitude_min_m: 0,
    altitude_max_m: 0,
    accumulated_climb_m: 0,
    start_point_gps: "",
    description: "",
    interaction_fauna: "",
    points_of_interest_ids: [],
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema(isEditing)),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (open) {
      if (route) {
        reset({
          name: route.name,
          distance_km: route.distance_km,
          duration: route.duration,
          route_type: route.route_type,
          difficulty: route.difficulty,
          altitude_min_m: route.altitude_min_m,
          altitude_max_m: route.altitude_max_m,
          accumulated_climb_m: route.accumulated_climb_m,
          start_point_gps: route.start_point_gps,
          description: route.description,
          interaction_fauna: route.interaction_fauna || "",
          points_of_interest_ids: route.points_of_interest.map((p) => p.id),
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [route, open, reset]);

  const createRouteMutation = useCreateRoute();
  const updateRouteMutation = useUpdateRoute();

  const onSubmit: SubmitHandler<RouteFormValues> = (data) => {
    const payload: RoutePayload = {
      ...data,
      interaction_fauna: data.interaction_fauna || "",
      points_of_interest_ids: data.points_of_interest_ids || [],
      image_card: data.image_card?.[0],
      image_map: data.image_map?.[0],
      gpx_file: data.gpx_file?.[0],
    };

    if (isEditing) {
      if (!payload.image_card) delete payload.image_card;
      if (!payload.image_map) delete payload.image_map;
      if (!payload.gpx_file) delete payload.gpx_file;
    }

    if (route) {
      updateRouteMutation.mutate(
        { id: route.id, payload },
        { onSuccess: onClose }
      );
    } else {
      createRouteMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  const isLoading =
    createRouteMutation.isPending || updateRouteMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{route ? "Edit Route" : "Add New Route"}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Section: Route Details */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>Route Details</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Route Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="distance_km"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Distance (km)" fullWidth type="number" error={!!errors.distance_km} helperText={errors.distance_km?.message} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Duration (e.g., 4h 30m)" fullWidth error={!!errors.duration} helperText={errors.duration?.message} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.difficulty}>
                    <InputLabel>Difficulty</InputLabel>
                    <Select {...field} label="Difficulty">
                      <MenuItem value="Easy">Easy</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="Hard">Hard</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="route_type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.route_type}>
                    <InputLabel>Route Type</InputLabel>
                    <Select {...field} label="Route Type">
                      <MenuItem value="circular">Circular</MenuItem>
                      <MenuItem value="linear">Linear</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Description" fullWidth multiline rows={3} error={!!errors.description} helperText={errors.description?.message} />
                )}
              />
            </Grid>

            {/* Section: Altitude & Location */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Altitude & Location</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="altitude_min_m"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Min Altitude (m)" fullWidth type="number" error={!!errors.altitude_min_m} helperText={errors.altitude_min_m?.message} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="altitude_max_m"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Max Altitude (m)" fullWidth type="number" error={!!errors.altitude_max_m} helperText={errors.altitude_max_m?.message} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
               <Controller
                name="accumulated_climb_m"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Accumulated Climb (m)" fullWidth type="number" error={!!errors.accumulated_climb_m} helperText={errors.accumulated_climb_m?.message} />
                )}
              />
            </Grid>
             <Grid size={{ xs: 12 }}>
               <Controller
                name="start_point_gps"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Start Point GPS (e.g., 40º7'14.40N / 7º32'38.08W)" fullWidth error={!!errors.start_point_gps} helperText={errors.start_point_gps?.message} />
                )}
              />
            </Grid>

            {/* Section: Points of Interest & Fauna */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Related Information</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="points_of_interest_ids"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    loading={poisLoading}
                    options={pointsOfInterest.map((p) => p.id)}
                    getOptionLabel={(option) =>
                      pointsOfInterest.find((p) => p.id === option)?.name || ""
                    }
                    value={field.value || []}
                    onChange={(_, newValue) => field.onChange(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Points of Interest (Optional)" helperText="Select multiple points of interest related to this route." />
                    )}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                            const label = pointsOfInterest.find(p => p.id === option)?.name;
                            return <Chip variant="outlined" label={label} {...getTagProps({ index })} />
                        })
                    }
                  />
                )}
              />
            </Grid>
             <Grid size={{ xs: 12 }}>
              <Controller
                name="interaction_fauna"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Fauna Interaction (Optional)"
                    fullWidth
                    multiline
                    rows={2}
                    helperText="Describe any notable fauna interactions on this route."
                  />
                )}
              />
            </Grid>

            {/* Section: File Uploads */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Files
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                {!isEditing ? "All files are required when creating a new route." : "Upload new files only if you want to replace the existing ones."}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FileInput
                control={control}
                name="image_card"
                label="Card Image"
                existingFileUrl={route?.image_card}
                accept="image/*"
                error={errors.image_card}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FileInput
                control={control}
                name="image_map"
                label="Map Image"
                existingFileUrl={route?.image_map}
                accept="image/*"
                error={errors.image_map}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FileInput
                control={control}
                name="gpx_file"
                label="GPX File"
                existingFileUrl={route?.gpx_file}
                accept=".gpx"
                error={errors.gpx_file}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
