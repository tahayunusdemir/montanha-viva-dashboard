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

function FormControlFormLabel({
  label,
  id,
  children,
  disabled = false,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <FormControl fullWidth disabled={disabled}>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      {children}
    </FormControl>
  );
}

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
                <FormControlFormLabel
                  label="First Name"
                  id="first-name"
                  disabled={!isEditMode}
                >
                  <OutlinedInput id="first-name" {...field} />
                </FormControlFormLabel>
              )}
            />
          </Grid>
          <Grid size={6}>
            <Controller
              name="last_name"
              control={control}
              render={({ field }) => (
                <FormControlFormLabel
                  label="Last Name"
                  id="last-name"
                  disabled={!isEditMode}
                >
                  <OutlinedInput id="last-name" {...field} />
                </FormControlFormLabel>
              )}
            />
          </Grid>
        </Grid>
        <FormControlFormLabel label="Email" id="email" disabled>
          <OutlinedInput id="email" value={user.email} readOnly />
        </FormControlFormLabel>
        <FormControlFormLabel label="Points" id="points" disabled>
          <OutlinedInput
            id="points"
            value={user.points !== undefined ? user.points : "N/A"}
            readOnly
          />
        </FormControlFormLabel>
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
