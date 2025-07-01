import React from "react";
import { Box, TextField, Button, InputAdornment } from "@mui/material";
import { Add, Search as SearchIcon } from "@mui/icons-material";
import { GridToolbarContainer } from "@mui/x-data-grid";

interface AdminTemplateToolbarProps {
  onAdd: () => void;
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
    <GridToolbarContainer
      sx={{
        p: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Button variant="contained" startIcon={<Add />} onClick={onAdd} autoFocus>
        {addButtonLabel}
      </Button>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
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
        {filterSlot}
      </Box>
    </GridToolbarContainer>
  );
}
