import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
} from "@mui/material";
import { AdminUser } from "@/types/user";

interface UserDetailsModalProps {
  open: boolean;
  onClose: () => void;
  user: AdminUser | null;
}

export default function UserDetailsModal({
  open,
  onClose,
  user,
}: UserDetailsModalProps) {
  if (!user) {
    return null;
  }

  const formattedDate = new Date(user.date_joined).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const details = [
    { label: "ID", value: String(user.id) },
    { label: "Role", value: user.role },
    { label: "First Name", value: user.first_name },
    { label: "Last Name", value: user.last_name },
    { label: "Email", value: user.email },
    {
      label: "Points",
      value: user.points !== undefined ? String(user.points) : "N/A",
    },
    { label: "Date Joined", value: formattedDate },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>User Details</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ p: 1 }}>
          <Grid container spacing={2}>
            {details.map((detail) => (
              <Grid size={{ xs: 12, sm: 6 }} key={detail.label}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {detail.label}
                </Typography>
                <Typography variant="body1">{detail.value || "-"}</Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
