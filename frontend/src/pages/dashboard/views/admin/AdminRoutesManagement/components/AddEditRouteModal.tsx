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
  FormLabel,
  InputLabel,
  Box,
  Typography,
  FormHelperText,
  styled,
} from "@mui/material";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Route, RoutePayload } from "@/types";
import { useCreateRoute, useUpdateRoute } from "@/services/routes";
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
    points_of_interest: z.string().optional(),
    image_card: isEditing
      ? z.instanceof(FileList).optional().nullable()
      : fileSchema,
    image_map: isEditing
      ? z.instanceof(FileList).optional().nullable()
      : fileSchema,
    gpx_file: z.instanceof(FileList).optional().nullable(),
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
    <FormControl fullWidth error={!!error} component="fieldset" sx={{ mb: 2 }}>
      <FormLabel component="legend">{label}</FormLabel>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUpload />}
              sx={{ width: "100%", justifyContent: "flex-start", py: 1.5, mt: 1 }}
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
    points_of_interest: "",
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
          points_of_interest: route.points_of_interest || "",
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
      points_of_interest: data.points_of_interest || "",
      image_card: data.image_card?.[0] || null,
      image_map: data.image_map?.[0] || null,
      gpx_file: data.gpx_file?.[0] || null,
    };

    // For updates, don't send file fields if they weren't changed
    if (isEditing) {
      if (!payload.image_card) delete payload.image_card;
      if (!payload.image_map) delete payload.image_map;
      if (!payload.gpx_file) delete payload.gpx_file;
    }

    const mutation = isEditing ? updateRouteMutation : createRouteMutation;
    const mutationArgs = isEditing ? { id: route!.id, payload } : payload;

    // Type assertion to satisfy TypeScript
    (mutation.mutate as (args: any, options: any) => void)(mutationArgs, {
      onSuccess: onClose,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? "Edit Route" : "Add New Route"}</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          id="route-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Info */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors.name} component="fieldset" sx={{ mb: 2 }}>
                <FormLabel required htmlFor="route-name">
                  Route Name
                </FormLabel>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="route-name"
                      fullWidth
                      required
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors.duration} component="fieldset" sx={{ mb: 2 }}>
                <FormLabel required htmlFor="route-duration">
                  Duration (e.g., 4h 30min)
                </FormLabel>
                <Controller
                  name="duration"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="route-duration"
                      fullWidth
                      required
                      error={!!errors.duration}
                      helperText={errors.duration?.message}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Metrics */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth error={!!errors.distance_km} component="fieldset" sx={{ mb: 2 }}>
                <FormLabel required htmlFor="route-distance-km">
                  Distance (km)
                </FormLabel>
                <Controller
                  name="distance_km"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="route-distance-km"
                      type="number"
                      fullWidth
                      required
                      error={!!errors.distance_km}
                      helperText={errors.distance_km?.message}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth error={!!errors.accumulated_climb_m} component="fieldset" sx={{ mb: 2 }}>
                <FormLabel required htmlFor="route-accumulated-climb-m">
                  Accumulated Climb (m)
                </FormLabel>
                <Controller
                  name="accumulated_climb_m"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="route-accumulated-climb-m"
                      type="number"
                      fullWidth
                      required
                      error={!!errors.accumulated_climb_m}
                      helperText={errors.accumulated_climb_m?.message}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth error={!!errors.altitude_max_m} component="fieldset" sx={{ mb: 2 }}>
                <FormLabel required htmlFor="route-altitude-max-m">
                  Max Altitude (m)
                </FormLabel>
                <Controller
                  name="altitude_max_m"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="route-altitude-max-m"
                      type="number"
                      fullWidth
                      required
                      error={!!errors.altitude_max_m}
                      helperText={errors.altitude_max_m?.message}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Selects */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors.difficulty} component="fieldset" sx={{ mb: 2 }}>
                <FormLabel component="legend" required>
                  Difficulty
                </FormLabel>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Difficulty">
                      <MenuItem value="Easy">Easy</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="Hard">Hard</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors.route_type} component="fieldset" sx={{ mb: 2 }}>
                <FormLabel component="legend" required>
                  Route Type
                </FormLabel>
                <Controller
                  name="route_type"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Route Type">
                      <MenuItem value="circular">Circular</MenuItem>
                      <MenuItem value="linear">Linear</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            {/* Text Areas */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth error={!!errors.description} component="fieldset" sx={{ mb: 2 }}>
                <FormLabel required htmlFor="description">
                  Description
                </FormLabel>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="description"
                      multiline
                      rows={2}
                      fullWidth
                      required
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth error={!!errors.points_of_interest} component="fieldset" sx={{ mb: 2 }}>
                <FormLabel htmlFor="points-of-interest">
                  Points of Interest (comma-separated)
                </FormLabel>
                <Controller
                  name="points_of_interest"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="points-of-interest"
                      multiline
                      rows={2}
                      fullWidth
                      error={!!errors.points_of_interest}
                      helperText={errors.points_of_interest?.message}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth error={!!errors.start_point_gps} component="fieldset" sx={{ mb: 2 }}>
                <FormLabel required htmlFor="start-point-gps">
                  Start Point GPS
                </FormLabel>
                <Controller
                  name="start_point_gps"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="start-point-gps"
                      fullWidth
                      required
                      error={!!errors.start_point_gps}
                      helperText={errors.start_point_gps?.message}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* File Inputs */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth error={!!errors.image_card} component="fieldset" sx={{ mb: 2 }}>
                <FormLabel required htmlFor="image-card-file-input" component="legend">
                  Upload Card Image
                </FormLabel>
                <FileInput
                  control={control}
                  name="image_card"
                  label=""
                  existingFileUrl={route?.image_card}
                  accept="image/*"
                  error={errors.image_card}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth error={!!errors.image_map} component="fieldset" sx={{ mb: 2 }}>
                <FormLabel required htmlFor="image-map-file-input" component="legend">
                  Upload Map Image
                </FormLabel>
                <FileInput
                  control={control}
                  name="image_map"
                  label=""
                  existingFileUrl={route?.image_map}
                  accept="image/*"
                  error={errors.image_map}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth error={!!errors.gpx_file} component="fieldset" sx={{ mb: 2 }}>
                <FormLabel required htmlFor="gpx-file-input" component="legend">
                  Upload GPX File
                </FormLabel>
                <FileInput
                  control={control}
                  name="gpx_file"
                  label=""
                  existingFileUrl={route?.gpx_file}
                  accept=".gpx"
                  error={errors.gpx_file}
                />
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          form="route-form"
          variant="contained"
          disabled={
            createRouteMutation.isPending || updateRouteMutation.isPending
          }
        >
          {isEditing ? "Save Changes" : "Create Route"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
