import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Button,
  Snackbar,
} from "@mui/material";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useScanQRCode } from "@/services/qr";
import PageLayout from "@/pages/dashboard/components/PageLayout";

const qrReaderId = "qr-reader";

export default function QRCodes() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scannerState, setScannerState] = useState<
    "idle" | "scanning" | "error"
  >("idle");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  } | null>(null);

  const scanMutation = useScanQRCode();

  useEffect(() => {
    scannerRef.current = new Html5Qrcode(qrReaderId);

    const cleanup = () => {
      if (
        scannerRef.current &&
        scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING
      ) {
        scannerRef.current.stop().catch((err) => {
          console.error("Failed to stop QR scanner:", err);
        });
      }
    };

    return cleanup;
  }, []);

  const handleStartScan = async () => {
    if (!scannerRef.current) return;

    setScannerState("scanning");
    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            // Makes the qrbox 80% of the smaller edge of the viewfinder.
            const qrboxSize = Math.floor(minEdge * 0.8);
            return {
              width: qrboxSize,
              height: qrboxSize,
            };
          },
        },
        (decodedText) => {
          handleStopScan();
          scanMutation.mutate(decodedText, {
            onSuccess: (data) => {
              setSnackbar({
                open: true,
                message: data.message,
                severity: "success",
              });
            },
            onError: (error: any) => {
              setSnackbar({
                open: true,
                message:
                  error?.response?.data?.error ||
                  error.message ||
                  "An unknown error occurred.",
                severity: "error",
              });
            },
          });
        },
        (errorMessage) => {
          // This callback is called frequently, so we don't do much here.
          // console.warn(`QR Code no longer in front of camera.`, errorMessage);
        },
      );
    } catch (err) {
      console.error("Error starting QR scanner:", err);
      setSnackbar({
        open: true,
        message: "Could not start camera. Please grant camera permissions.",
        severity: "error",
      });
      setScannerState("error");
    }
  };

  const handleStopScan = () => {
    if (
      scannerRef.current &&
      scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING
    ) {
      scannerRef.current.stop();
      setScannerState("idle");
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom>
        Scan QR Code
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
          How it works
        </Typography>
        <Typography component="div" variant="body2">
          Earn points by scanning the QR codes you find along the mountain
          trails. Each unique scan will bring you closer to unlocking rewards.
          <br />
          <br />
          Just press <strong>Start Scan</strong> and point your camera at a
          code!
        </Typography>
      </Alert>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          maxWidth: 500,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="body1">
          Position a QR code inside the viewfinder to scan it.
        </Typography>

        <Box
          id={qrReaderId}
          sx={{
            width: "100%",
            minHeight: "300px",
            background: "#f0f0f0",
            borderRadius: 1,
            overflow: "hidden",
            position: "relative",
            display: scannerState !== "scanning" ? "none" : "block",
            "& video": {
              width: "100%",
              height: "100%",
              objectFit: "cover",
            },
            "& #qr-reader__scan_region": {
              borderRadius: "8px",
              border: "4px solid rgba(255, 255, 255, 0.5) !important",
              boxShadow: "0 0 0 4000px rgba(0, 0, 0, 0.3)",
            },
          }}
        />

        {scannerState === "idle" && (
          <Button
            variant="contained"
            onClick={handleStartScan}
            disabled={scanMutation.isPending}
          >
            {scanMutation.isPending ? "Processing..." : "Start Scan"}
          </Button>
        )}

        {scannerState === "scanning" && (
          <Button variant="outlined" color="error" onClick={handleStopScan}>
            Stop Scan
          </Button>
        )}

        {scannerState === "error" && (
          <Alert severity="error">
            Failed to start the camera. Please ensure you have given the
            necessary permissions and try again.
          </Alert>
        )}

        {scanMutation.isPending && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress size={24} />
            <Typography>Processing Scan...</Typography>
          </Box>
        )}
      </Paper>
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
