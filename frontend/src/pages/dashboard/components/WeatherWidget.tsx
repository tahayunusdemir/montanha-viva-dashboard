import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  CircularProgress,
  Typography,
  Box,
  Card,
  CardContent,
  Stack,
  Alert,
  Popover,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import WbCloudyIcon from "@mui/icons-material/WbCloudy";
import GrainIcon from "@mui/icons-material/Grain";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { WaterDrop, Opacity } from "@mui/icons-material";

import { weatherService } from "@/services/weather";
import { WeatherForecast, WeatherLocation } from "@/types/weather";

// Mapping from IPMA weather type ID to description and icon
const weatherTypeMap: { [key: number]: { desc: string; icon: React.ElementType } } = {
  1: { desc: "Clear sky", icon: WbSunnyIcon },
  2: { desc: "Partly cloudy", icon: WbCloudyIcon },
  3: { desc: "Partly cloudy", icon: WbCloudyIcon },
  4: { desc: "Very cloudy or overcast", icon: WbCloudyIcon },
  5: { desc: "Showers", icon: WaterDrop },
  6: { desc: "Rain", icon: GrainIcon },
  7: { desc: "Heavy rain", icon: GrainIcon },
  8: { desc: "Heavy showers", icon: WaterDrop },
  9: { desc: "Showers", icon: WaterDrop },
  10: { desc: "Light rain or drizzle", icon: Opacity },
  11: { desc: "Rain", icon: GrainIcon },
  12: { desc: "Heavy rain", icon: GrainIcon },
  13: { desc: "Frost", icon: AcUnitIcon },
  14: { desc: "Haze", icon: WbCloudyIcon },
  15: { desc: "Fog", icon: WbCloudyIcon },
  18: { desc: "Snow", icon: AcUnitIcon },
  19: { desc: "Thunderstorm", icon: ThunderstormIcon },
  20: { desc: "Showers with thunderstorm", icon: ThunderstormIcon },
  24: { desc: "Sky clouded by high clouds", icon: WbCloudyIcon },
  27: { desc: "Sky with cloudy periods", icon: WbCloudyIcon },
};

const getWeatherDisplay = (id: number) => {
  return weatherTypeMap[id] || { desc: 'Unknown', icon: HelpOutlineIcon };
};

const DailyForecastItem: React.FC<{ day: WeatherForecast }> = ({ day }) => {
  const { icon: WeatherIcon } = getWeatherDisplay(day.idWeatherType);
  return (
    <ListItem sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <ListItemIcon sx={{ minWidth: 'auto' }}>
          <WeatherIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
        </ListItemIcon>
        <Stack>
          <Typography variant="body1" fontWeight="medium">
            {new Date(day.forecastDate).toLocaleDateString('en-US', { weekday: 'long' })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {day.tMin}°C / {day.tMax}°C
          </Typography>
        </Stack>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
        {day.precipitaProb}% Rain
      </Typography>
    </ListItem>
  );
};

interface WeatherForecastPopoverProps {
  locations: WeatherLocation[] | undefined;
  selectedLocation: number | "";
  onLocationChange: (locationId: number) => void;
  forecast: { data: WeatherForecast[] } | null | undefined;
  isLoading: boolean;
  error: Error | null;
}

const WeatherForecastPopover: React.FC<WeatherForecastPopoverProps> = ({
  locations,
  selectedLocation,
  onLocationChange,
  forecast,
  isLoading,
  error,
}) => {
  const locationName =
    locations?.find((l) => l.globalIdLocal === selectedLocation)?.local || "Location";

  return (
    <Box sx={{ p: 2, minWidth: 320 }}>
      <Stack spacing={2}>
        <Typography variant="h6">5-Day Weather Forecast</Typography>
        <FormControl fullWidth size="small">
          <FormLabel id="location-popover-select-label" sx={{ mb: 1 }}>Location</FormLabel>
          <Select
            labelId="location-popover-select-label"
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value as number)}
          >
            {locations?.map((location) => (
              <MenuItem key={location.globalIdLocal} value={location.globalIdLocal}>
                {location.local}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {isLoading && <CircularProgress sx={{ alignSelf: 'center' }} />}
        {error && <Alert severity="error">Could not load forecast.</Alert>}
        {forecast?.data && (
          <List>
            <Typography variant="subtitle1" sx={{ px: 2, pt: 1, fontWeight: 'bold' }}>
              {locationName}
            </Typography>
            {forecast.data.map((day, index) => (
              <React.Fragment key={day.forecastDate}>
                <DailyForecastItem day={day} />
                {index < forecast.data.length - 1 && <Divider component="li" variant="inset" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Stack>
    </Box>
  );
};

export const WeatherWidget: React.FC = () => {
  // Default to Castelo Branco (globalIdLocal: 1050200)
  const [selectedLocation, setSelectedLocation] = useState<number | "">(1050200);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const {
    data: locations,
    isLoading: isLoadingLocations,
  } = useQuery({
    queryKey: ["weatherLocations"],
    queryFn: weatherService.getLocations,
  });

  const {
    data: forecast,
    isLoading: isLoadingForecast,
    error: forecastError,
  } = useQuery({
    queryKey: ["weatherForecast", selectedLocation],
    queryFn: () => {
      if (!selectedLocation) return null;
      return weatherService.getForecast(selectedLocation);
    },
    enabled: !!selectedLocation,
  });

  const handleOpenPopover = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'weather-popover' : undefined;

  const todayForecast = forecast?.data?.[0];
  const TodayWeatherIcon = todayForecast ? getWeatherDisplay(todayForecast.idWeatherType).icon : HelpOutlineIcon;

  if (isLoadingLocations) {
    return <Chip label={<CircularProgress size={20} />} sx={{ height: "2.25rem" }} />;
  }

  return (
    <div>
      <Chip
        aria-describedby={id}
        icon={<TodayWeatherIcon />}
        label={todayForecast ? `${todayForecast.tMax}°C` : "N/A"}
        onClick={handleOpenPopover}
        variant="outlined"
        sx={{
          height: "2.25rem",
          "& .MuiChip-icon": {
            fontSize: "1rem",
          },
        }}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <WeatherForecastPopover
          locations={locations}
          selectedLocation={selectedLocation}
          onLocationChange={(locationId) => setSelectedLocation(locationId)}
          forecast={forecast}
          isLoading={isLoadingForecast}
          error={forecastError}
        />
      </Popover>
    </div>
  );
}; 