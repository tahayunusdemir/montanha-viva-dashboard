import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
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
import { styled } from "@mui/material/styles";
import AppTheme from "@/theme/AppTheme";

import { confirmPasswordReset } from "@/services/auth";
import type { PasswordResetConfirmPayload } from "@/types/auth";

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

type ResetPasswordFormData = {
  new_password: string;
  re_new_password: string;
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
}));

const ResetPasswordContainer = styled(Stack)(({ theme }) => ({
  height: "100vh",
  minHeight: "100%",
  padding: theme.spacing(2),
}));

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      new_password: "",
      re_new_password: "",
    },
  });

  const mutation = useMutation<
    { detail: string },
    Error,
    PasswordResetConfirmPayload
  >({
    mutationFn: confirmPasswordReset,
  });

  const onSubmit: SubmitHandler<ResetPasswordFormData> = (data) => {
    const uidb64 = searchParams.get("uidb64");
    const token = searchParams.get("token");

    if (!uidb64 || !token) {
      mutation.mutate(undefined as any); // Trigger error state
      return;
    }

    mutation.mutate({
      uidb64,
      token,
      new_password: data.new_password,
      re_new_password: data.re_new_password,
    });
  };

  const uidb64 = searchParams.get("uidb64");
  const token = searchParams.get("token");
  const isInvalidLink = !uidb64 || !token;

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <ResetPasswordContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <Typography component="h1" variant="h4" sx={{ width: "100%" }}>
            Set new password
          </Typography>
          {mutation.isSuccess ? (
            <Stack spacing={2}>
              <Alert severity="success">{mutation.data.detail}</Alert>
              <Button component={RouterLink} to="/sign-in" variant="contained">
                Go to Sign In
              </Button>
            </Stack>
          ) : (
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
              {isInvalidLink && (
                <Alert severity="error">
                  This password reset link is invalid or has expired. Please
                  request a new one.
                </Alert>
              )}
              {mutation.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {getErrorMessage(mutation.error)}
                </Alert>
              )}
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
                  <FormControl>
                    <FormLabel htmlFor="new_password">New password</FormLabel>
                    <TextField
                      {...field}
                      placeholder="••••••"
                      type="password"
                      id="new_password"
                      required
                      fullWidth
                      variant="outlined"
                      error={!!errors.new_password}
                      helperText={errors.new_password?.message}
                      disabled={isInvalidLink}
                    />
                  </FormControl>
                )}
              />
              <Controller
                name="re_new_password"
                control={control}
                rules={{
                  required: "Password confirmation is required",
                  validate: (value) =>
                    value === watch("new_password") ||
                    "The passwords do not match",
                }}
                render={({ field }) => (
                  <FormControl>
                    <FormLabel htmlFor="re_new_password">
                      Confirm new password
                    </FormLabel>
                    <TextField
                      {...field}
                      placeholder="••••••"
                      type="password"
                      id="re_new_password"
                      required
                      fullWidth
                      variant="outlined"
                      error={!!errors.re_new_password}
                      helperText={errors.re_new_password?.message}
                      disabled={isInvalidLink}
                    />
                  </FormControl>
                )}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={mutation.isPending || isInvalidLink}
              >
                {mutation.isPending
                  ? "Resetting Password..."
                  : "Reset Password"}
              </Button>
            </Box>
          )}
        </Card>
      </ResetPasswordContainer>
    </AppTheme>
  );
}
