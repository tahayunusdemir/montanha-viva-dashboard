import * as React from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  FormLabel,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { changePassword } from "@/services/auth";
import type { ChangePasswordData } from "@/types/auth";

interface PasswordResetTabProps {
  onSnackbar: (message: string, severity: "success" | "error") => void;
}

export default function PasswordResetTab({
  onSnackbar,
}: PasswordResetTabProps) {
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordData>({
    defaultValues: {
      current_password: "",
      new_password: "",
      re_new_password: "",
    },
  });

  const handlePasswordChange: SubmitHandler<ChangePasswordData> = async (
    data,
  ) => {
    setLoading(true);
    try {
      await changePassword(data);
      onSnackbar("Password updated successfully", "success");
      reset();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.current_password?.[0] ||
        error.response?.data?.new_password?.[0] ||
        "An error occurred while updating the password.";
      onSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handlePasswordChange)}>
      <Stack spacing={2}>
        <Controller
          name="current_password"
          control={control}
          rules={{ required: "Current password is required" }}
          render={({ field }) => (
            <FormControl fullWidth variant="outlined">
              <FormLabel htmlFor="current-password">Current Password</FormLabel>
              <OutlinedInput
                {...field}
                id="current-password"
                type={showPassword ? "text" : "password"}
                error={!!errors.current_password}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {errors.current_password && (
                <Typography variant="caption" color="error">
                  {errors.current_password.message}
                </Typography>
              )}
            </FormControl>
          )}
        />
        <Controller
          name="new_password"
          control={control}
          rules={{
            required: "New password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          }}
          render={({ field }) => (
            <FormControl fullWidth>
              <FormLabel htmlFor="new-password">New Password</FormLabel>
              <TextField
                {...field}
                id="new-password"
                type="password"
                error={!!errors.new_password}
                helperText={errors.new_password?.message}
              />
            </FormControl>
          )}
        />
        <Controller
          name="re_new_password"
          control={control}
          rules={{
            required: "Please confirm your new password",
            validate: (value) =>
              value === watch("new_password") || "The passwords do not match",
          }}
          render={({ field }) => (
            <FormControl fullWidth>
              <FormLabel htmlFor="re-new-password">
                New Password (Confirm)
              </FormLabel>
              <TextField
                {...field}
                id="re-new-password"
                type="password"
                error={!!errors.re_new_password}
                helperText={errors.re_new_password?.message}
              />
            </FormControl>
          )}
        />
      </Stack>
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Update Password"}
        </Button>
      </Box>
    </form>
  );
}
