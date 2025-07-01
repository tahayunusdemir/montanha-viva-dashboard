import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import { AdminUser, UserUpdatePayload } from "@/types/user";

interface UserEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: UserUpdatePayload) => void;
  user: AdminUser | null;
  isSaving: boolean;
}

export default function UserEditModal({
  open,
  onClose,
  onSave,
  user,
  isSaving,
}: UserEditModalProps) {
  const [role, setRole] = useState<"Admin" | "User">("User");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (user) {
      setRole(user.is_staff ? "Admin" : "User");
      setIsActive(user.is_active);
    }
  }, [user]);

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    setRole(event.target.value as "Admin" | "User");
  };

  const handleIsActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsActive(event.target.checked);
  };

  const handleSave = () => {
    if (!user) return;

    const payload: UserUpdatePayload = {};
    if ((role === "Admin") !== user.is_staff) {
      payload.is_staff = role === "Admin";
    }
    if (isActive !== user.is_active) {
      payload.is_active = isActive;
    }

    // Only call onSave if there's something to update
    if (Object.keys(payload).length > 0) {
      onSave(payload);
    } else {
      onClose(); // Or show a message that there are no changes
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="subtitle1">
            {user.first_name} {user.last_name}
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={role}
              label="Role"
              onChange={handleRoleChange}
              disabled={user.role === "Super Admin"}
            >
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={handleIsActiveChange}
                disabled={user.role === "Super Admin"}
              />
            }
            label="Is Active"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
