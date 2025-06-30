import React from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { GridToolbarContainer } from "@mui/x-data-grid";
import { FeedbackStatus } from "@/types/feedback";

interface FeedbackToolbarProps {
  searchText: string;
  onSearchTextChange: (value: string) => void;
  statusFilter: FeedbackStatus | "";
  onStatusFilterChange: (value: FeedbackStatus | "") => void;
}

export default function FeedbackToolbar({
  searchText,
  onSearchTextChange,
  statusFilter,
  onStatusFilterChange,
}: FeedbackToolbarProps) {
  return (
    <GridToolbarContainer>
      <Box
        sx={{
          flexGrow: 1,
          p: 2,
          display: "flex",
          gap: 2,
          alignItems: "center",
        }}
      >
        <TextField
          label="Search by name/email"
          variant="outlined"
          size="small"
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) =>
              onStatusFilterChange(e.target.value as FeedbackStatus | "")
            }
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </GridToolbarContainer>
  );
}
