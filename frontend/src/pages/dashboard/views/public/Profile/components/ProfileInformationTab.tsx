import * as React from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  OutlinedInput,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useForm, Controller } from "react-hook-form";
import type { User } from "@/types";
import { updateMe } from "@/services/auth";

interface ProfileInformationTabProps {
  user: User;
  onUpdate: (user: User) => void;
  onSnackbar: (message: string, severity: "success" | "error") => void;
}

type FormData = {
  first_name: string;
  last_name: string;
};

export default function ProfileInformationTab({
  user,
  onUpdate,
  onSnackbar,
}: ProfileInformationTabProps) {
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const { control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
    },
  });

  React.useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
      });
    }
  }, [user, reset]);

  const handleProfileSave = async (data: FormData) => {
    setLoading(true);
    try {
      const updatedUser = await updateMe({
        first_name: data.first_name,
        last_name: data.last_name,
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
    reset({
      first_name: user.first_name,
      last_name: user.last_name,
    });
    setIsEditMode(false);
  };

  return (
    <form onSubmit={handleSubmit(handleProfileSave)}>
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Controller
              name="first_name"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth disabled={!isEditMode}>
                  <FormLabel htmlFor="first-name">First Name</FormLabel>
                  <OutlinedInput id="first-name" {...field} />
                </FormControl>
              )}
            />
          </Grid>
          <Grid size={6}>
            <Controller
              name="last_name"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth disabled={!isEditMode}>
                  <FormLabel htmlFor="last-name">Last Name</FormLabel>
                  <OutlinedInput id="last-name" {...field} />
                </FormControl>
              )}
            />
          </Grid>
        </Grid>
        <FormControl fullWidth disabled>
          <FormLabel htmlFor="email">Email</FormLabel>
          <OutlinedInput id="email" value={user.email} readOnly />
        </FormControl>
        <FormControl fullWidth disabled>
          <FormLabel htmlFor="points">Points</FormLabel>
          <OutlinedInput
            id="points"
            value={user.points !== undefined ? user.points : "N/A"}
            readOnly
          />
        </FormControl>
      </Stack>
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        {isEditMode ? (
          <>
            <Button sx={{ mr: 1 }} onClick={handleCancel} variant="outlined">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Save"}
            </Button>
          </>
        ) : (
          <Button variant="contained" onClick={() => setIsEditMode(true)}>
            Edit
          </Button>
        )}
      </Box>
    </form>
  );
}
