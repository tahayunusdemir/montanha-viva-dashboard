import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Grid,
  Typography,
  FormControl,
  FormLabel,
} from "@mui/material";
import { Station } from "@/types";
import dayjs from "dayjs";

interface StationDetailsModalProps {
  open: boolean;
  onClose: () => void;
  station: Station | null;
}

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <FormControl fullWidth>
    <FormLabel>{label}</FormLabel>
    <Typography variant="body1" component="div">
      {value || "N/A"}
    </Typography>
  </FormControl>
);

const StationDetailsModal = ({
  open,
  onClose,
  station,
}: StationDetailsModalProps) => {
  if (!station) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Station Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid size={{ xs: 6 }}>
            <DetailItem label="Station ID" value={station.station_id} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <DetailItem label="Name" value={station.name} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <DetailItem label="Location" value={station.location} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <DetailItem
              label="Status"
              value={
                <Chip
                  label={station.is_active ? "Active" : "Inactive"}
                  color={station.is_active ? "success" : "default"}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              }
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <DetailItem
              label="Created At"
              value={dayjs(station.created_at).format("YYYY-MM-DD HH:mm:ss")}
            />
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
};

export default StationDetailsModal;
