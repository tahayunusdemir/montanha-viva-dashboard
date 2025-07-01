import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import { requestPasswordReset } from "@/services/auth";
import { PasswordResetRequestPayload } from "@/types/auth";

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

type FormValues = {
  email: string;
};

export default function ForgotPassword({
  open,
  handleClose,
}: ForgotPasswordProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ defaultValues: { email: "" } });

  const mutation = useMutation({
    mutationFn: (data: PasswordResetRequestPayload) =>
      requestPasswordReset(data),
    onSuccess: () => {
      // Keep the dialog open to show the success message
    },
    onError: () => {
      // Error is handled by displaying the alert
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    mutation.mutate(data);
  };

  const handleDialogClose = () => {
    reset(); // Reset form state
    mutation.reset(); // Reset mutation state
    handleClose(); // Close the dialog
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit(onSubmit),
        sx: { backgroundImage: "none" },
      }}
    >
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent sx={{ width: "100%" }}>
        {mutation.isSuccess ? (
          <Alert severity="success">
            If an account with that email exists, we've sent a link to reset
            your password.
          </Alert>
        ) : (
          <>
            <DialogContentText sx={{ mb: 2 }}>
              Enter your account's email address, and we&apos;ll send you a link
              to reset your password.
            </DialogContentText>
            {mutation.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {mutation.error.message ||
                  "An error occurred. Please try again."}
              </Alert>
            )}
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required.",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address.",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  autoFocus
                  required
                  margin="dense"
                  id="email"
                  label="Email address"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleDialogClose}>
          {mutation.isSuccess ? "Close" : "Cancel"}
        </Button>
        {!mutation.isSuccess && (
          <Button
            variant="contained"
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Sending..." : "Continue"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
