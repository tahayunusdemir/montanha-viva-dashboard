import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Grid,
  Link,
} from "@mui/material";
import { QRCode } from "@/types";
import { format } from "date-fns";

interface ViewQRCodeModalProps {
  open: boolean;
  onClose: () => void;
  qrCode: QRCode | null;
}

export default function ViewQRCodeModal({
  open,
  onClose,
  qrCode,
}: ViewQRCodeModalProps) {
  if (!qrCode) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        QR Code Details:{" "}
        <Typography component="span" variant="h6" color="primary">
          {qrCode.name}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={12} sx={{ textAlign: "center" }}>
            <Box
              component="img"
              src={qrCode.qr_image}
              alt={`QR Code for ${qrCode.name}`}
              sx={{
                width: 200,
                height: 200,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 1,
              }}
            />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              <Link href={qrCode.qr_image} target="_blank" download>
                Download QR Code
              </Link>
            </Typography>
          </Grid>
          <Grid size={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              ID
            </Typography>
            <Typography variant="body1">{qrCode.id}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              Points
            </Typography>
            <Typography variant="body1">{qrCode.points}</Typography>
          </Grid>
          <Grid size={12} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Text Content
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
              {qrCode.text_content}
            </Typography>
          </Grid>
          <Grid size={12} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Created At
            </Typography>
            <Typography variant="body1">
              {format(new Date(qrCode.created_at), "PPP p")}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
