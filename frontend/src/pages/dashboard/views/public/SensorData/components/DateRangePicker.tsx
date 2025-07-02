import { Box, Typography, FormControl, FormLabel } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

interface DateRange {
  start: Dayjs | null;
  end: Dayjs | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (newValue: DateRange) => void;
  disabled?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
}

const DateRangePicker = ({
  value,
  onChange,
  disabled,
  minDate,
  maxDate,
}: DateRangePickerProps) => {
  const handleStartDateChange = (newValue: Dayjs | null) => {
    onChange({ ...value, start: newValue });
  };

  const handleEndDateChange = (newValue: Dayjs | null) => {
    onChange({ ...value, end: newValue });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" alignItems="flex-end" gap={1}>
        <FormControl fullWidth>
          <FormLabel sx={{ mb: 1 }}>Start Date</FormLabel>
          <DatePicker
            value={value.start}
            onChange={handleStartDateChange}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </FormControl>
        <Typography pb={1}>–</Typography>
        <FormControl fullWidth>
          <FormLabel sx={{ mb: 1 }}>End Date</FormLabel>
          <DatePicker
            value={value.end}
            onChange={handleEndDateChange}
            disabled={disabled}
            minDate={value.start || minDate}
            maxDate={maxDate}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </FormControl>
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;
