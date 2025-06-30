import {
  useForm,
  type SubmitHandler,
  Controller,
  type FieldValues,
} from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import Alert from "@mui/material/Alert";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import AppTheme from "../../theme/AppTheme";

import { register } from "../../services/auth";
import { useAuthStore } from "../../store/authStore";
import type { RegisterData } from "../../types/auth";
import type { AuthResponse } from "../../types";

// Helper to extract error messages from Axios error responses
const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError && error.response) {
    const { data } = error.response;
    if (data && typeof data === "object") {
      // Handle generic detail message
      const detail = data.detail as string | undefined;
      if (detail) {
        return detail;
      }
      // Extract the first error message from other backend responses
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

type SignUpFormData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function SignUp(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<SignUpFormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });
  const login = useAuthStore((state) => state.login);
  const setUser = useAuthStore((state) => state.setUser);

  const mutation = useMutation<AuthResponse, Error, RegisterData>({
    mutationFn: register,
    onSuccess: (data) => {
      login({ access: data.access, refresh: data.refresh });
      setUser(data.user);
      navigate("/dashboard");
    },
  });

  const onSubmit: SubmitHandler<SignUpFormData> = (data) => {
    mutation.mutate({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Sign up
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {mutation.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {getErrorMessage(mutation.error)}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="first_name"
                  control={control}
                  rules={{ required: "First name is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <FormLabel htmlFor="first_name">First Name</FormLabel>
                      <TextField
                        {...field}
                        autoComplete="given-name"
                        required
                        id="first_name"
                        placeholder="Name"
                        error={!!errors.first_name}
                        helperText={errors.first_name?.message}
                      />
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="last_name"
                  control={control}
                  rules={{ required: "Last name is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <FormLabel htmlFor="last_name">Last Name</FormLabel>
                      <TextField
                        {...field}
                        autoComplete="family-name"
                        required
                        id="last_name"
                        placeholder="Surname"
                        error={!!errors.last_name}
                        helperText={errors.last_name?.message}
                      />
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
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
                <FormControl>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <TextField
                    {...field}
                    required
                    fullWidth
                    id="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    variant="outlined"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                </FormControl>
              )}
            />
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
                <FormControl>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <TextField
                    {...field}
                    required
                    fullWidth
                    placeholder="••••••"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    variant="outlined"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                </FormControl>
              )}
            />
            <Controller
              name="passwordConfirmation"
              control={control}
              rules={{
                required: "Password confirmation is required",
                validate: (value) =>
                  value === watch("password") || "The passwords do not match",
              }}
              render={({ field }) => (
                <FormControl>
                  <FormLabel htmlFor="passwordConfirmation">
                    Confirm Password
                  </FormLabel>
                  <TextField
                    {...field}
                    required
                    fullWidth
                    placeholder="••••••"
                    type="password"
                    id="passwordConfirmation"
                    autoComplete="new-password"
                    variant="outlined"
                    error={!!errors.passwordConfirmation}
                    helperText={errors.passwordConfirmation?.message}
                  />
                </FormControl>
              )}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Signing Up..." : "Sign Up"}
            </Button>
          </Box>
          <Typography sx={{ textAlign: "center" }}>
            Already have an account?{" "}
            <Link href="/sign-in" variant="body2" sx={{ alignSelf: "center" }}>
              Sign in
            </Link>
          </Typography>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
