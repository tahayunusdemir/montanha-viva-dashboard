import { useState, useMemo, useRef, createRef } from "react";
import {
  Stack,
  Typography,
  Button,
  CircularProgress,
  Box,
  Alert,
  Grid,
  Tabs,
  Tab,
  Paper,
  FormControl,
  FormLabel,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DownloadIcon from "@mui/icons-material/Download";
import Image from "@mui/icons-material/Image";
import dayjs, { Dayjs } from "dayjs";
import { saveAs } from "file-saver";
import PageLayout from "@/pages/dashboard/components/PageLayout";
import StationSelector from "./components/StationSelector";
import DateRangePicker from "./components/DateRangePicker";
import SensorChart from "./components/SensorChart";
import MeasurementTable from "./components/MeasurementTable";
import MeasurementTypeSelector from "./components/MeasurementTypeSelector";
import stationService from "@/services/station";
import { Measurement } from "@/types";

interface DateRange {
  start: Dayjs | null;
  end: Dayjs | null;
}

function SensorData() {
  const queryClient = useQueryClient();
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: dayjs().subtract(1, "day").startOf("day"),
    end: dayjs().subtract(1, "day").endOf("day"),
  });
  const [isFetchInitiated, setIsFetchInitiated] = useState(false);
  const [currentTab, setCurrentTab] = useState("table");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isGuideVisible, setIsGuideVisible] = useState(true);
  const chartRef = useRef<{ exportAsPng: () => Promise<string> } | null>(null);

  const { data: availability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ["availability", selectedStation],
    queryFn: () => stationService.getStationDataAvailability(selectedStation!),
    enabled: !!selectedStation,
  });

  const canFetch =
    selectedStation !== null &&
    dateRange.start !== null &&
    dateRange.end !== null;

  const {
    data: measurements,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "measurements",
      selectedStation,
      dateRange.start?.toISOString(),
      dateRange.end?.toISOString(),
    ],
    queryFn: () =>
      stationService.getMeasurements(
        selectedStation!,
        dateRange.start!.toISOString(),
        dateRange.end!.toISOString(),
      ),
    enabled: canFetch && isFetchInitiated,
    staleTime: 5 * 60 * 1000,
  });

  useMemo(() => {
    if (measurements) {
      const allTypes = Array.from(
        new Set(measurements.map((item: Measurement) => item.measurement_type)),
      );
      setSelectedTypes(allTypes);
    }
  }, [measurements]);

  const availableTypes = useMemo(() => {
    if (!measurements) return [];
    return Array.from(new Set(measurements.map((m) => m.measurement_type)));
  }, [measurements]);

  const filteredMeasurements = useMemo(() => {
    if (!measurements) return [];
    return measurements.filter((m) =>
      selectedTypes.includes(m.measurement_type),
    );
  }, [measurements, selectedTypes]);

  const handleStationChange = (stationId: string | null) => {
    setSelectedStation(stationId);
    setIsFetchInitiated(false);
    setSelectedTypes([]);
    queryClient.removeQueries({ queryKey: ["measurements"] });
  };

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
    setIsFetchInitiated(false);
    setSelectedTypes([]);
    queryClient.removeQueries({ queryKey: ["measurements"] });
  };

  const handleFetchClick = () => {
    if (canFetch) {
      setIsFetchInitiated(true);
    }
  };
  const handleDownloadChart = async () => {
    if (chartRef.current) {
      const pngData = await chartRef.current.exportAsPng();
      saveAs(pngData, "sensor-chart.png");
    }
  };
  const downloadMutation = useMutation<string, Error, Measurement[]>({
    mutationFn: (dataToDownload: Measurement[]) => {
      // Convert to CSV
      const header = ["recorded_at", ...selectedTypes].join(",");
      const pivotedData = dataToDownload.reduce(
        (acc, { recorded_at, measurement_type, value }) => {
          const time = dayjs(recorded_at).format("YYYY-MM-DD HH:mm:ss");
          if (!acc[time]) {
            acc[time] = { recorded_at: time };
          }
          acc[time][measurement_type] = value;
          return acc;
        },
        {} as Record<string, any>,
      );
      const rows = Object.values(pivotedData).map((row: any) =>
        [row.recorded_at, ...selectedTypes.map((type) => row[type] || "")].join(
          ",",
        ),
      );

      return Promise.resolve([header, ...rows].join("\n"));
    },
    onSuccess: (csvData) => {
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `measurements-${selectedStation}-${dayjs(dateRange.start).format(
          "YYYY-MM-DD",
        )}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  });

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom>
        Sensor Data
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <StationSelector
              value={selectedStation}
              onChange={handleStationChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 8, md: 7 }}>
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              minDate={
                availability?.min_date
                  ? dayjs(availability.min_date)
                  : undefined
              }
              maxDate={
                availability?.max_date
                  ? dayjs(availability.max_date)
                  : undefined
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 2 }}>
            <Button
              fullWidth
              onClick={handleFetchClick}
              disabled={!canFetch || isLoading}
              variant="contained"
              sx={{ height: "56px" }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Get Data"
              )}
            </Button>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>Measurement Types</FormLabel>
              <MeasurementTypeSelector
                availableTypes={availableTypes}
                selectedTypes={selectedTypes}
                onChange={setSelectedTypes}
                disabled={!measurements || measurements.length === 0}
              />
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {isGuideVisible && (
        <Alert
          severity="info"
          sx={{ mt: 2 }}
          onClose={() => setIsGuideVisible(false)}
        >
          <Typography variant="body2">
            <b>Step 1:</b> Select a station to see the available date range and
            measurement types.
            <br />
            <b>Step 2:</b> Choose a date range and the specific measurements you
            want to analyze.
            <br />
            <b>Step 3:</b> Click "Get Data" to load the information into the
            table and chart below.
          </Typography>
        </Alert>
      )}

      <Box mt={2}>
        {isLoadingAvailability && !selectedStation && (
          <Alert severity="info">
            Select a station to see data availability.
          </Alert>
        )}
        {availability && (
          <Alert severity="info">
            Data available for this station from{" "}
            {dayjs(availability.min_date).format("YYYY-MM-DD")} to{" "}
            {dayjs(availability.max_date).format("YYYY-MM-DD")}.
          </Alert>
        )}

        {isFetchInitiated && isLoading && (
          <Box textAlign="center" mt={4}>
            <CircularProgress />
            <Typography>Loading measurements...</Typography>
          </Box>
        )}
        {isFetchInitiated && isError && (
          <Alert severity="error">
            Error fetching data:{" "}
            {error instanceof Error
              ? error.message
              : "An unknown error occurred"}
          </Alert>
        )}
        {!isFetchInitiated && !isLoading && !availability && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Please select a station and a date range, then click "Get Data" to
            view measurements.
          </Alert>
        )}
        {isFetchInitiated &&
          !isLoading &&
          measurements &&
          measurements.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              No data available for the selected station and date range.
            </Alert>
          )}

        {measurements && measurements.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Tabs
                value={currentTab}
                onChange={(e, newValue) => setCurrentTab(newValue)}
              >
                <Tab label="Table" value="table" />
                <Tab label="Chart" value="chart" />
              </Tabs>
              {currentTab === "table" && (
                <Button
                  startIcon={
                    downloadMutation.isPending ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <DownloadIcon />
                    )
                  }
                  onClick={() => downloadMutation.mutate(filteredMeasurements)}
                  disabled={
                    !filteredMeasurements ||
                    filteredMeasurements.length === 0 ||
                    downloadMutation.isPending
                  }
                  variant="contained"
                >
                  Download as CSV
                </Button>
              )}
              {currentTab === "chart" && (
                <Button
                  startIcon={<Image />}
                  onClick={handleDownloadChart}
                  disabled={
                    !filteredMeasurements || filteredMeasurements.length === 0
                  }
                  variant="contained"
                >
                  Download as PNG
                </Button>
              )}
            </Box>

            {currentTab === "table" && (
              <MeasurementTable
                data={measurements || []}
                selectedTypes={selectedTypes}
              />
            )}
            {currentTab === "chart" && (
              <SensorChart ref={chartRef} data={filteredMeasurements || []} />
            )}
          </Box>
        )}
      </Box>
    </PageLayout>
  );
}

export default SensorData;
