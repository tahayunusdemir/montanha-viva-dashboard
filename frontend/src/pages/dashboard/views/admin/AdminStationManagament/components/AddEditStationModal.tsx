import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  Switch,
  Box,
} from "@mui/material";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import { Station, StationPayload } from "@/types";

interface AddEditStationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StationPayload) => void;
  station: Station | null;
}

const AddEditStationModal = ({
  open,
  onClose,
  onSubmit,
  station,
}: AddEditStationModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StationPayload>();

  const isEditMode = station !== null;

  useEffect(() => {
    if (open) {
      if (isEditMode) {
        reset(station);
      } else {
        reset({
          station_id: "",
          name: "",
          location: "",
          is_active: true,
        });
      }
    }
  }, [open, station, isEditMode, reset]);

  const handleFormSubmit: SubmitHandler<StationPayload> = (data) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? "Edit Station" : "Add New Station"}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box
            component="div"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              pt: 1,
            }}
          >
            <FormControl fullWidth>
              <FormLabel>Station ID</FormLabel>
              <Controller
                name="station_id"
                control={control}
                defaultValue=""
                rules={{ required: "Station ID is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={isEditMode}
                    error={!!errors.station_id}
                    helperText={errors.station_id?.message}
                  />
                )}
              />
            </FormControl>
            <FormControl fullWidth>
              <FormLabel>Station Name</FormLabel>
              <Controller
                name="name"
                control={control}
                defaultValue=""
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </FormControl>
            <FormControl fullWidth>
              <FormLabel>Location</FormLabel>
              <Controller
                name="location"
                control={control}
                defaultValue=""
                render={({ field }) => <TextField {...field} fullWidth />}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Active</FormLabel>
              <Controller
                name="is_active"
                control={control}
                defaultValue={true}
                render={({ field }) => (
                  <Switch {...field} checked={field.value} color="primary" />
                )}
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEditMode ? "Save Changes" : "Create Station"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddEditStationModal;
