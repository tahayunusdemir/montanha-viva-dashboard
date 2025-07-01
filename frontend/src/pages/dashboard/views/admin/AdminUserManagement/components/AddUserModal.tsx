import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { CreateUserPayload } from "@/types/user";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateUserPayload) => void;
  isSaving: boolean;
  error: { message: string } | null;
}

type FormValues = Omit<CreateUserPayload, "is_staff"> & {
  role: "User" | "Admin";
};

export default function AddUserModal({
  open,
  onClose,
  onSave,
  isSaving,
  error,
}: AddUserModalProps) {
  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      re_password: "",
      role: "User",
    },
  });

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const { role, ...rest } = data;
    const payload: CreateUserPayload = {
      ...rest,
      is_staff: role === "Admin",
    };
    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message || "An error occurred while creating the user."}
            </Alert>
          )}
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="first_name"
                control={control}
                rules={{ required: "First name is required" }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.first_name}>
                    <FormLabel>First Name</FormLabel>
                    <TextField
                      {...field}
                      fullWidth
                      required
                      autoFocus
                      error={!!errors.first_name}
                      helperText={errors.first_name?.message}
                    />
                  </FormControl>
                )}
              />
              <Controller
                name="last_name"
                control={control}
                rules={{ required: "Last name is required" }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.last_name}>
                    <FormLabel>Last Name</FormLabel>
                    <TextField
                      {...field}
                      fullWidth
                      required
                      error={!!errors.last_name}
                      helperText={errors.last_name?.message}
                    />
                  </FormControl>
                )}
              />
            </Stack>
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.email}>
                  <FormLabel>Email</FormLabel>
                  <TextField
                    {...field}
                    type="email"
                    fullWidth
                    required
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                </FormControl>
              )}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.password}>
                    <FormLabel>Password</FormLabel>
                    <TextField
                      {...field}
                      type="password"
                      fullWidth
                      required
                      error={!!errors.password}
                      helperText={errors.password?.message}
                    />
                  </FormControl>
                )}
              />
              <Controller
                name="re_password"
                control={control}
                rules={{
                  required: "Please confirm password",
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match",
                }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.re_password}>
                    <FormLabel>Confirm Password</FormLabel>
                    <TextField
                      {...field}
                      type="password"
                      fullWidth
                      required
                      error={!!errors.re_password}
                      helperText={errors.re_password?.message}
                    />
                  </FormControl>
                )}
              />
            </Stack>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <FormLabel id="role-select-label">Role</FormLabel>
                  <Select {...field} labelId="role-select-label" label="Role">
                    <MenuItem value="User">User</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: "16px 24px" }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
