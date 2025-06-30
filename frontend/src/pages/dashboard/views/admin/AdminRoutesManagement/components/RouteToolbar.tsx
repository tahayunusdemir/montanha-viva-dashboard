import React from "react";
import { Box, Button, TextField, InputAdornment } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { GridToolbarContainer, GridToolbarProps } from "@mui/x-data-grid";

interface RouteToolbarCustomProps {
  onAddClick: () => void;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchText: string;
}

export default function RouteToolbar(
  props: GridToolbarProps & RouteToolbarCustomProps,
) {
  const { onAddClick, onSearchChange, searchText } = props;

  return (
    <GridToolbarContainer>
      <TextField
        variant="outlined"
        placeholder="Search routes..."
        value={searchText}
        onChange={onSearchChange}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ width: 320 }}
      />
      <Box sx={{ flex: 1 }} />
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={onAddClick}
      >
        Add Route
      </Button>
    </GridToolbarContainer>
  );
}
