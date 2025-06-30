import * as React from "react";
import { Alert, Button, CircularProgress } from "@mui/material";

interface DeleteAccountTabProps {
  loading: boolean;
  onDelete: () => void;
}

export default function DeleteAccountTab({
  loading,
  onDelete,
}: DeleteAccountTabProps) {
  return (
    <>
      <Alert severity="error" sx={{ mb: 2 }}>
        This action cannot be undone. Are you sure you want to delete your
        account?
      </Alert>
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
    </>
  );
}
