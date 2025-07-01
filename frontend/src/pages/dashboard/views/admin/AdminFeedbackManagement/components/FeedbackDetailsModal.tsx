import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Paper,
  FormControl,
  FormLabel,
} from "@mui/material";
import { Feedback, FeedbackStatus } from "@/types/feedback";

const statusColors: {
  [key in FeedbackStatus]: "default" | "info" | "success" | "warning";
} = {
  pending: "warning",
  in_progress: "info",
  resolved: "success",
  closed: "default",
};

interface FeedbackDetailsModalProps {
  open: boolean;
  onClose: () => void;
  feedback: Feedback | null;
}

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <FormControl
    fullWidth
    margin="dense"
    component="fieldset"
    variant="standard"
    sx={{ mb: 2 }}
  >
    <FormLabel
      component="legend"
      sx={{ color: "text.secondary", fontSize: "0.75rem", mb: 0.5 }}
    >
      {label}
    </FormLabel>
    <Box sx={{ mt: 0.5, wordBreak: "break-word" }}>{value}</Box>
  </FormControl>
);

export default function FeedbackDetailsModal({
  open,
  onClose,
  feedback,
}: FeedbackDetailsModalProps) {
  if (!feedback) return null;

  const statusLabel = feedback.status
    ? feedback.status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())
    : "N/A";

  const statusColor = feedback.status
    ? statusColors[feedback.status]
    : "default";

  const fullName = feedback.user_details
    ? `${feedback.user_details.first_name || ""} ${feedback.user_details.last_name || ""}`.trim()
    : `${feedback.name || ""} ${feedback.surname || ""}`.trim() || "Anonymous";

  const email = feedback.user_details?.email || feedback.email || "N/A";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Feedback Details</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexWrap: "wrap", rowGap: 2 }}>
          <Box sx={{ width: { xs: "100%", sm: "50%" }, pr: { sm: 1 } }}>
            <DetailItem
              label="From"
              value={<Typography variant="body1">{fullName}</Typography>}
            />
          </Box>
          <Box sx={{ width: { xs: "100%", sm: "50%" }, pl: { sm: 1 } }}>
            <DetailItem
              label="Email"
              value={<Typography variant="body1">{email}</Typography>}
            />
          </Box>
          <Box sx={{ width: { xs: "100%", sm: "50%" }, pr: { sm: 1 } }}>
            <DetailItem
              label="Submitted At"
              value={
                <Typography variant="body1">
                  {new Date(feedback.created_at).toLocaleString()}
                </Typography>
              }
            />
          </Box>
          <Box sx={{ width: { xs: "100%", sm: "50%" }, pl: { sm: 1 } }}>
            <DetailItem
              label="Status"
              value={
                <Chip label={statusLabel} color={statusColor} size="small" />
              }
            />
          </Box>
          <Box sx={{ width: "100%", mt: 1 }}>
            <DetailItem
              label="Subject"
              value={
                <Typography variant="body1">{feedback.subject}</Typography>
              }
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <FormControl
          fullWidth
          margin="dense"
          component="fieldset"
          variant="standard"
          sx={{ mb: 2 }}
        >
          <FormLabel
            component="legend"
            sx={{ color: "text.secondary", fontSize: "0.75rem", mb: 0.5 }}
          >
            Message
          </FormLabel>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mt: 1,
              maxHeight: 300,
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              bgcolor: "action.hover",
            }}
          >
            <Typography variant="body1">{feedback.message}</Typography>
          </Paper>
        </FormControl>

        {feedback.document && (
          <FormControl
            fullWidth
            margin="dense"
            component="fieldset"
            variant="standard"
            sx={{ mb: 2 }}
          >
            <FormLabel
              component="legend"
              sx={{ color: "text.secondary", fontSize: "0.75rem", mb: 0.5 }}
            >
              Attachment
            </FormLabel>
            <Button
              variant="outlined"
              component="a"
              href={feedback.document}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ mt: 1 }}
            >
              Download Document
            </Button>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
