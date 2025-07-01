import React from "react";
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  FormControl,
  FormLabel,
} from "@mui/material";
import { Add, Search as SearchIcon } from "@mui/icons-material";

interface AdminTemplateToolbarProps {
  onAdd?: () => void;
  addButtonLabel: string;
  onSearchTextChange: (value: string) => void;
  searchText: string;
  filterSlot?: React.ReactNode;
}

export default function AdminTemplateToolbar({
  onAdd,
  addButtonLabel,
  onSearchTextChange,
  searchText,
  filterSlot,
}: AdminTemplateToolbarProps) {
  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {onAdd && (
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAdd}
          autoFocus
        >
          {addButtonLabel}
        </Button>
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          alignItems: "flex-end",
        }}
      >
        <FormControl>
          <FormLabel>Search</FormLabel>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => onSearchTextChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />
        </FormControl>
        {filterSlot}
      </Box>
    </Box>
  );
}
