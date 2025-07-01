import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { Feedback, FeedbackStatus } from "@/types/feedback";

interface EditFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  feedback: Feedback | null;
  onStatusChange: (event: SelectChangeEvent<FeedbackStatus>) => void;
}

export default function EditFeedbackModal({
  open,
  onClose,
  feedback,
  onStatusChange,
}: EditFeedbackModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Feedback Status</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <FormLabel>Status</FormLabel>
          <Select
            value={feedback?.status || ""}
            onChange={onStatusChange}
            sx={{ mt: 1 }}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
