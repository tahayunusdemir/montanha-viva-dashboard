import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Grid,
  Chip,
  Snackbar,
} from "@mui/material";
import { QrCodeScanner, Receipt, Star } from "@mui/icons-material";
import { useRewardsData, useGenerateCoupon } from "@/services/qr";
import PageLayout from "@/pages/dashboard/components/PageLayout";
import { format } from "date-fns";
import { useAuthStore } from "@/store/authStore";

function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`rewards-tabpanel-${index}`}
      aria-labelledby={`rewards-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PointsAndRewards() {
  const { data, isLoading, isError, error } = useRewardsData();
  const generateCouponMutation = useGenerateCoupon();
  const [tabIndex, setTabIndex] = React.useState(0);
  const user = useAuthStore((state) => state.user);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleGenerateCoupon = () => {
    generateCouponMutation.mutate(undefined, {
      onSuccess: (coupon) => {
        setSnackbar({
          open: true,
          message: `Coupon ${coupon.code} generated successfully!`,
          severity: "success",
        });
      },
      onError: (err) => {
        setSnackbar({
          open: true,
          message: err.message || "Failed to generate coupon.",
          severity: "error",
        });
      },
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <CircularProgress />
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout>
        <Alert severity="error">
          Error loading rewards data: {error?.message}
        </Alert>
      </PageLayout>
    );
  }

  const POINTS_FOR_COUPON = 100;
  const canGenerateCoupon = (data?.points || 0) >= POINTS_FOR_COUPON;

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom>
        Points & Rewards
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Track your points, view your scan history, and redeem your points for
        exclusive coupons.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              height: "100%",
            }}
          >
            <Star sx={{ fontSize: 60, color: "warning.main" }} />
            <Typography variant="h3">{data?.points ?? 0}</Typography>
            <Typography variant="h6" color="text.secondary">
              Total Points
            </Typography>
            <Button
              variant="contained"
              onClick={handleGenerateCoupon}
              disabled={!canGenerateCoupon || generateCouponMutation.isPending}
              sx={{ mt: 2 }}
            >
              {generateCouponMutation.isPending
                ? "Generating..."
                : `Get Coupon (${POINTS_FOR_COUPON} pts)`}
            </Button>
            {!canGenerateCoupon && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                You need at least {POINTS_FOR_COUPON} points to get a coupon.
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                aria-label="rewards history tabs"
                variant="fullWidth"
              >
                <Tab
                  icon={<QrCodeScanner />}
                  iconPosition="start"
                  label="Scan History"
                />
                <Tab
                  icon={<Receipt />}
                  iconPosition="start"
                  label="My Coupons"
                />
              </Tabs>
            </Box>
            <TabPanel value={tabIndex} index={0}>
              <List>
                {data?.scan_history.length === 0 && (
                  <Typography>No QR codes scanned yet.</Typography>
                )}
                {data?.scan_history.map((scan) => (
                  <React.Fragment key={scan.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${scan.qr_code.name}`}
                        secondary={`Scanned on ${format(
                          new Date(scan.scanned_at),
                          "PPP p",
                        )}`}
                      />
                      <Chip
                        label={`+${scan.qr_code.points} pts`}
                        color="success"
                        size="small"
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </TabPanel>
            <TabPanel value={tabIndex} index={1}>
              <List>
                {data?.coupon_history.length === 0 && (
                  <Typography>No coupons generated yet.</Typography>
                )}
                {data?.coupon_history.map((coupon) => (
                  <React.Fragment key={coupon.id}>
                    <ListItem>
                      <ListItemText
                        primary={`Code: ${coupon.code}`}
                        secondary={`Expires on ${format(
                          new Date(coupon.expires_at),
                          "PPP",
                        )}`}
                      />
                      <Chip
                        label={coupon.is_used ? "Used" : "Active"}
                        color={coupon.is_used ? "default" : "primary"}
                        size="small"
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
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
    </PageLayout>
  );
}
