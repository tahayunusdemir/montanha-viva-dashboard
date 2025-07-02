import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Snackbar,
  Alert,
  FormControl,
  FormLabel,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useCreateQRCode, QRCodeCreatePayload } from "@/services/qr";

interface AddQRCodeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddQRCodeModal({ open, onClose }: AddQRCodeModalProps) {
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QRCodeCreatePayload>({
    defaultValues: { name: "", text_content: "", points: 10 },
  });

  useEffect(() => {
    if (open) {
      reset({ name: "", text_content: "", points: 10 });
    }
  }, [open, reset]);

  const createQRCodeMutation = useCreateQRCode();

  const onSubmit = (data: QRCodeCreatePayload) => {
    const payload = {
      ...data,
      points: Number(data.points), // Ensure points is a number
    };

    createQRCodeMutation.mutate(payload, {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: "QR Code created successfully!",
          severity: "success",
        });
        reset();
        onClose();
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: `Error: ${error.message}`,
          severity: "error",
        });
      },
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Generate New QR Code</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={12}>
                <FormControl fullWidth error={!!errors.name} sx={{ mb: 2 }}>
                  <FormLabel>QR Code Name</FormLabel>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: "Name is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid size={12}>
                <FormControl fullWidth error={!!errors.text_content} sx={{ mb: 2 }}>
                  <FormLabel>Text or URL for QR Code</FormLabel>
                  <Controller
                    name="text_content"
                    control={control}
                    rules={{ required: "Text or URL is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        error={!!errors.text_content}
                        helperText={errors.text_content?.message}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid size={12}>
                <FormControl fullWidth error={!!errors.points} sx={{ mb: 2 }}>
                  <FormLabel>Points</FormLabel>
                  <Controller
                    name="points"
                    control={control}
                    rules={{
                      required: "Points are required",
                      min: { value: 1, message: "Points must be positive" },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="number"
                        fullWidth
                        error={!!errors.points}
                        helperText={errors.points?.message}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createQRCodeMutation.isPending}
            >
              {createQRCodeMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {snackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </>
  );
}
