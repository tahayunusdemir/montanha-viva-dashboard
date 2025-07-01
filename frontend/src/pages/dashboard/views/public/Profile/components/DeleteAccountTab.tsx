import * as React from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  Typography,
  Box,
} from "@mui/material";

interface DeleteAccountTabProps {
  loading: boolean;
  onDelete: () => void;
}

export default function DeleteAccountTab({
  loading,
  onDelete,
}: DeleteAccountTabProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="body1">
        Permanently remove your account and all of its content from the
        platform. This action is not reversible, so please continue with
        caution.
      </Typography>
      <Alert severity="error" sx={{ mb: 2 }}>
        This action cannot be undone. Are you sure you want to delete your
        account?
      </Alert>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="error"
          onClick={onDelete}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Delete My Account"
          )}
        </Button>
      </Box>
    </Stack>
  );
}
