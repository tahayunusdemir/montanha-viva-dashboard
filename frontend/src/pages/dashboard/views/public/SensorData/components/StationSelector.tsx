import {
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import stationService from "@/services/station";

interface StationSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const StationSelector = ({
  value,
  onChange,
  disabled,
}: StationSelectorProps) => {
  const {
    data: stations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["stations"],
    queryFn: stationService.getStations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <FormControl fullWidth sx={{ minWidth: 200 }}>
      <FormLabel id="station-select-label">Station</FormLabel>
      <Select
        labelId="station-select-label"
        id="station-select"
        value={value || ""}
        onChange={(e) => onChange(e.target.value as string)}
        disabled={isLoading || isError || disabled}
      >
        {isLoading ? (
          <MenuItem value="" disabled>
            <CircularProgress size={20} />
            <span style={{ marginLeft: 8 }}>Loading...</span>
          </MenuItem>
        ) : (
          stations
            ?.filter((s) => s.is_active)
            .map((station) => (
              <MenuItem key={station.station_id} value={station.station_id}>
                {station.name}
              </MenuItem>
            ))
        )}
      </Select>
      {isError && (
        <FormHelperText error>Failed to load stations.</FormHelperText>
      )}
    </FormControl>
  );
};

export default StationSelector;
