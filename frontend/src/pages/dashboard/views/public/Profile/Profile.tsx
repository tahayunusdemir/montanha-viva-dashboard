import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Tab,
  Tabs,
  Typography,
  FormControl,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/pages/dashboard/components/PageLayout";
import { useAuthStore } from "@/store/authStore";
import { deleteAccount, getMe } from "@/services/auth";
import type { User } from "@/types";
import DeleteAccountTab from "./components/DeleteAccountTab";
import PasswordResetTab from "./components/PasswordResetTab";
import ProfileInformationTab from "./components/ProfileInformationTab";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Profile() {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  React.useEffect(() => {
    let isMounted = true;

    if (!user && !isDeleting) {
      setLoading(true);
      getMe()
        .then((userData) => {
          if (isMounted) {
            setUser(userData);
          }
        })
        .catch(() => {
          if (isMounted) {
            logout();
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [user, setUser, logout, isDeleting]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleDeleteAccount = async () => {
    setOpenDeleteDialog(false);
    setIsDeleting(true);
    setLoading(true);
    try {
      await deleteAccount();
      logout(true);
      handleSnackbar("Account deleted. You are being logged out...", "info");
      setTimeout(() => {
        navigate("/sign-in");
      }, 2000);
    } catch (error) {
      handleSnackbar("An error occurred while deleting the account.", "error");
      setLoading(false);
      setIsDeleting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!user || loading) {
    return (
      <PageLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Typography variant="h4" gutterBottom>
            Profile Management
          </Typography>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <FormControl component="fieldset" sx={{ pl: 3, width: "100%" }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="profile management tabs"
                >
                  <Tab label="Profile Information" id="profile-tab-0" />
                  <Tab label="Password Reset" id="profile-tab-1" />
                  <Tab label="Delete Account" id="profile-tab-2" />
                </Tabs>
              </FormControl>
            </Box>
            <CardContent>
              <TabPanel value={tabValue} index={0}>
                <ProfileInformationTab
                  user={user}
                  onUpdate={handleProfileUpdate}
                  onSnackbar={handleSnackbar}
                />
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <PasswordResetTab onSnackbar={handleSnackbar} />
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                <DeleteAccountTab
                  loading={loading}
                  onDelete={() => setOpenDeleteDialog(true)}
                />
              </TabPanel>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Account Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to permanently delete your account? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" autoFocus>
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
}
