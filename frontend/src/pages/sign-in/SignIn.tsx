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
import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import ForgotPassword from "./components/ForgotPassword";
import AppTheme from "../../theme/AppTheme";

import { login } from "../../services/auth";
import { useAuthStore } from "../../store/authStore";
import type { LoginCredentials } from "../../types/auth";
import type { AuthResponse } from "../../types";

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

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
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

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginCredentials>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  const loginAction = useAuthStore((state) => state.login);
  const setUser = useAuthStore((state) => state.setUser);

  const mutation = useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: login,
    onSuccess: (data) => {
      loginAction({ access: data.access });
      setUser(data.user);
      navigate("/dashboard");
    },
  });

  const onSubmit: SubmitHandler<LoginCredentials> = (data) => {
    mutation.mutate(data);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            {mutation.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {getErrorMessage(mutation.error)}
              </Alert>
            )}
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
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    autoFocus
                    required
                    fullWidth
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
              }}
              render={({ field }) => (
                <FormControl>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <TextField
                    {...field}
                    placeholder="••••••"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    required
                    fullWidth
                    variant="outlined"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                </FormControl>
              )}
            />
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      color="primary"
                    />
                  }
                  label="Remember me"
                />
              )}
            />
            <ForgotPassword open={open} handleClose={handleClose} />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Signing In..." : "Sign In"}
            </Button>
            <Link
              component="button"
              type="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: "center" }}
            >
              Forgot your password?
            </Link>
            <Typography sx={{ textAlign: "center" }}>
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                variant="body2"
                sx={{ alignSelf: "center" }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
