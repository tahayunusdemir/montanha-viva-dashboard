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
import { AxiosError } from "axios";
import { login } from "../services/auth";
import { useAuthStore } from "../store/authStore";
import type { LoginCredentials } from "../types/auth";
import type { Tokens } from "../types";

// Helper to extract error messages from Axios error responses
const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError && error.response) {
    const { data } = error.response;
    if (data && typeof data === "object") {
      const detail = data.detail as string | undefined;
      if (detail) {
        return detail;
      }
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

const SignInPage = () => {
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginCredentials>();
  const loginAction = useAuthStore((state) => state.login);

  const mutation = useMutation<Tokens, Error, LoginCredentials>({
    mutationFn: login,
    onSuccess: (data) => {
      loginAction({ access: data.access, refresh: data.refresh });
      navigate("/dashboard");
    },
  });

  const onSubmit: SubmitHandler<LoginCredentials> = (data) => {
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
          Sign In
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
                autoFocus
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
            rules={{ required: "Password is required" }}
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
            {mutation.isPending ? "Signing In..." : "Sign In"}
          </Button>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Link to="/sign-up">Don't have an account? Sign Up</Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default SignInPage;
