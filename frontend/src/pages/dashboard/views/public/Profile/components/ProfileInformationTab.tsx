import * as React from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  OutlinedInput,
} from "@mui/material";
import type { User } from "@/types";
import { updateMe } from "@/services/auth";

interface ProfileInformationTabProps {
  user: User;
  onUpdate: (user: User) => void;
  onSnackbar: (message: string, severity: "success" | "error") => void;
}

export default function ProfileInformationTab({
  user,
  onUpdate,
  onSnackbar,
}: ProfileInformationTabProps) {
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [firstName, setFirstName] = React.useState(user.first_name);
  const [lastName, setLastName] = React.useState(user.last_name);

  React.useEffect(() => {
    if (!isEditMode) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
    }
  }, [user, isEditMode]);

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      const updatedUser = await updateMe({
        first_name: firstName,
        last_name: lastName,
      });
      onUpdate(updatedUser);
      onSnackbar("Profile information updated successfully", "success");
      setIsEditMode(false);
    } catch (error) {
      onSnackbar("An error occurred while updating the profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        {!isEditMode && (
          <Button variant="contained" onClick={() => setIsEditMode(true)}>
            Edit
          </Button>
        )}
      </Box>
      <FormControl fullWidth margin="normal" disabled={!isEditMode}>
        <FormLabel htmlFor="first-name">First Name</FormLabel>
        <OutlinedInput
          id="first-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal" disabled={!isEditMode}>
        <FormLabel htmlFor="last-name">Last Name</FormLabel>
        <OutlinedInput
          id="last-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal" disabled>
        <FormLabel htmlFor="email">Email</FormLabel>
        <OutlinedInput id="email" value={user.email} readOnly />
      </FormControl>
      {isEditMode && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button sx={{ mr: 1 }} onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleProfileSave}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </Box>
      )}
    </>
  );
}
