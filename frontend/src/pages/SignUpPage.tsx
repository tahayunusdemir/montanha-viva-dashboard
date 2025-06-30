import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import { register } from "../services/auth";
import { useAuthStore } from "../store/authStore";
import type { RegisterData } from "../types/auth";
import type { AuthResponse } from "../types";
import { AxiosError } from "axios";

// Helper to extract error messages from Axios error responses
const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError && error.response) {
    const { data } = error.response;
    if (data && typeof data === "object") {
      // Extract the first error message from the backend response
      const errorKey = Object.keys(data)[0];
      const errorMessage = data[errorKey as keyof typeof data];
      if (Array.isArray(errorMessage)) {
        return errorMessage[0];
      }
      return String(errorMessage);
    }
  }
  return "An unexpected error occurred. Please try again.";
};

const SignUpPage = () => {
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterData>();
  const login = useAuthStore((state) => state.login);

  const mutation = useMutation<AuthResponse, Error, RegisterData>({
    mutationFn: register,
    onSuccess: (data) => {
      login({ access: data.access, refresh: data.refresh });
      navigate("/dashboard");
    },
  });

  const onSubmit: SubmitHandler<RegisterData> = (data) => {
    mutation.mutate(data);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ mt: 3, width: "100%" }}
        >
          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {getErrorMessage(mutation.error)}
            </Alert>
          )}

          <Controller
            name="first_name"
            control={control}
            defaultValue=""
            rules={{ required: "First name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="First Name"
                fullWidth
                autoFocus
                margin="normal"
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
              />
            )}
          />

          <Controller
            name="last_name"
            control={control}
            defaultValue=""
            rules={{ required: "Last name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Last Name"
                fullWidth
                margin="normal"
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email Address"
                type="email"
                fullWidth
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            defaultValue=""
            rules={{
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            )}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Signing Up..." : "Sign Up"}
          </Button>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Link to="/sign-in">Already have an account? Sign in</Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default SignUpPage;
