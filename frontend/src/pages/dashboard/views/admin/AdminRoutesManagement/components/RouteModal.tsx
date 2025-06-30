import React from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Route } from "@/types/routes";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  maxHeight: "90vh",
  overflowY: "auto",
};

const routeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  distance_km: z.number().positive("Distance must be positive"),
  duration: z.string().min(1, "Duration is required"),
  route_type: z.enum(["circular", "linear"]),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  altitude_min_m: z.number().int(),
  altitude_max_m: z.number().int(),
  accumulated_climb_m: z.number().int(),
  start_point_gps: z.string().optional(),
  description: z.string().min(1, "Description is required"),
});

type RouteFormData = z.infer<typeof routeSchema>;

interface RouteModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  route?: Route | null;
}

export default function RouteModal({
  open,
  onClose,
  onSubmit,
  route,
}: RouteModalProps) {
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: route?.name || "",
      distance_km: route?.distance_km || 0,
      duration: route?.duration || "",
      route_type: route?.route_type || "circular",
      difficulty: route?.difficulty || "Medium",
      altitude_min_m: route?.altitude_min_m || 0,
      altitude_max_m: route?.altitude_max_m || 0,
      accumulated_climb_m: route?.accumulated_climb_m || 0,
      start_point_gps: route?.start_point_gps || "",
      description: route?.description || "",
    },
  });

  const handleFormSubmit = (data: RouteFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    // Handle file inputs separately
    // if (imageCard) formData.append('image_card', imageCard);
    // if (imageMap) formData.append('image_map', imageMap);
    // if (gpxFile) formData.append('gpx_file', gpxFile);
    onSubmit(formData);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          {route ? "Edit Route" : "Add New Route"}
        </Typography>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              {...register("name")}
              label="Name"
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              {...register("distance_km", { valueAsNumber: true })}
              label="Distance (km)"
              type="number"
              error={!!errors.distance_km}
              helperText={errors.distance_km?.message}
            />
            <TextField
              {...register("duration")}
              label="Duration"
              error={!!errors.duration}
              helperText={errors.duration?.message}
            />
            <FormControl fullWidth error={!!errors.route_type}>
              <InputLabel>Route Type</InputLabel>
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
              {errors.route_type && (
                <FormHelperText>{errors.route_type.message}</FormHelperText>
              )}
            </FormControl>
            {/* Add other fields here */}
            <Button type="submit" variant="contained">
              {route ? "Save Changes" : "Create Route"}
            </Button>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
}
