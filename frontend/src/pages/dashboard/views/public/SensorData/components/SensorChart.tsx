import { useMemo, forwardRef, useImperativeHandle, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Paper,
  Typography,
  useTheme,
  FormControl,
  FormLabel,
} from "@mui/material";
import { Measurement } from "@/types";
import dayjs from "dayjs";
import { toPng } from "html-to-image";

interface SensorChartProps {
  data: Measurement[];
}

// Helper to assign a color to each measurement type
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
];

const SensorChart = forwardRef(({ data }: SensorChartProps, ref) => {
  const theme = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    exportAsPng: async () => {
      if (chartContainerRef.current) {
        const dataUrl = await toPng(chartContainerRef.current, {
          backgroundColor: theme.palette.background.paper,
        });
        return dataUrl;
      }
      return Promise.reject("Chart container not found");
    },
  }));

  const { chartData, measurementTypes } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], measurementTypes: [] };
    }

    const groupedData = data.reduce(
      (acc, { recorded_at, measurement_type, value }) => {
        const time = dayjs(recorded_at).format("YYYY-MM-DD HH:mm");
        if (!acc[time]) {
          acc[time] = { time };
        }
        acc[time][measurement_type] = value;
        return acc;
      },
      {} as Record<string, any>,
    );

    const types = Array.from(
      new Set(data.map((item) => item.measurement_type)),
    );

    return { chartData: Object.values(groupedData), measurementTypes: types };
  }, [data]);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2 }} ref={chartContainerRef}>
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend">
          <Typography variant="h6" gutterBottom>
            Sensor Measurements
          </Typography>
        </FormLabel>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fill: theme.palette.text.secondary }}
              tickFormatter={(timeStr) => dayjs(timeStr).format("HH:mm")}
            />
            <YAxis tick={{ fill: theme.palette.text.secondary }} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider,
              }}
            />
            <Legend />
            {measurementTypes.map((type, index) => (
              <Line
                key={type}
                type="monotone"
                dataKey={type}
                stroke={COLORS[index % COLORS.length]}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </FormControl>
    </Paper>
  );
});

export default SensorChart;
