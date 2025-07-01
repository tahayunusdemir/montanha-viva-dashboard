import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  Box,
} from "@mui/material";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  contentText: string;
}

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  contentText,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle color="error">{title}</DialogTitle>
      <DialogContent>
        <FormControl
          fullWidth
          component="fieldset"
          variant="standard"
          sx={{ mt: 1 }}
        >
          <FormLabel
            component="legend"
            sx={{ color: "text.secondary", fontSize: "0.95rem", mb: 1 }}
          >
            {title}
          </FormLabel>
          <Box sx={{ mt: 1, mb: 1, color: "text.primary" }}>{contentText}</Box>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onConfirm} color="error">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
