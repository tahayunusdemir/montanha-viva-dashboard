import * as React from "react";
import { Box, Button, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface PlantToolbarProps {
  onAddPlant: () => void;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchQuery: string;
}

export default function PlantToolbar({
  onAddPlant,
  onSearchChange,
  searchQuery,
}: PlantToolbarProps) {
  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <TextField
        variant="outlined"
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search plants..."
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
      <Button variant="contained" color="primary" onClick={onAddPlant}>
        New Plant
      </Button>
    </Box>
  );
}
