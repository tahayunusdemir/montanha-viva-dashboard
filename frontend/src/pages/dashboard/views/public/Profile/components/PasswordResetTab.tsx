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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { changePassword } from "@/services/auth";

interface PasswordResetTabProps {
  onSnackbar: (message: string, severity: "success" | "error") => void;
}

export default function PasswordResetTab({
  onSnackbar,
}: PasswordResetTabProps) {
  const [loading, setLoading] = React.useState(false);
  const [passwords, setPasswords] = React.useState({
    current_password: "",
    new_password: "",
    re_new_password: "",
  });
  const [showPassword, setShowPassword] = React.useState(false);

  const handlePasswordChange = async () => {
    if (passwords.new_password !== passwords.re_new_password) {
      onSnackbar("New passwords do not match.", "error");
      return;
    }
    if (!passwords.current_password || !passwords.new_password) {
      onSnackbar("Please fill in all fields.", "error");
      return;
    }
    setLoading(true);
    try {
      await changePassword(passwords);
      onSnackbar("Password updated successfully", "success");
      setPasswords({
        current_password: "",
        new_password: "",
        re_new_password: "",
      });
    } catch (error) {
      onSnackbar("An error occurred while updating the password.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FormControl fullWidth margin="normal" variant="outlined">
        <FormLabel htmlFor="current-password">Current Password</FormLabel>
        <OutlinedInput
          id="current-password"
          type={showPassword ? "text" : "password"}
          value={passwords.current_password}
          onChange={(e) =>
            setPasswords({ ...passwords, current_password: e.target.value })
          }
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
      </FormControl>
      <FormControl fullWidth margin="normal" variant="outlined">
        <FormLabel htmlFor="new-password">New Password</FormLabel>
        <OutlinedInput
          id="new-password"
          type={showPassword ? "text" : "password"}
          value={passwords.new_password}
          onChange={(e) =>
            setPasswords({ ...passwords, new_password: e.target.value })
          }
        />
      </FormControl>
      <FormControl fullWidth margin="normal" variant="outlined">
        <FormLabel htmlFor="re-new-password">New Password (Confirm)</FormLabel>
        <OutlinedInput
          id="re-new-password"
          type={showPassword ? "text" : "password"}
          value={passwords.re_new_password}
          onChange={(e) =>
            setPasswords({ ...passwords, re_new_password: e.target.value })
          }
        />
      </FormControl>
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={handlePasswordChange}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Update Password"}
        </Button>
      </Box>
    </>
  );
}
