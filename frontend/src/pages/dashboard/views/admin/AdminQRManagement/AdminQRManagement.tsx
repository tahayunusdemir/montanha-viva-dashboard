import React, { useState, useMemo } from "react";
import { GridColDef } from "@mui/x-data-grid";
import { format } from "date-fns";
import { Snackbar, Alert } from "@mui/material";
import AdminTemplate from "../components/AdminTemplate/AdminTemplate";
import AddQRCodeModal from "./components/AddQRCodeModal";
import ViewQRCodeModal from "./components/ViewQRCodeModal";
import { useQRCodes, useDeleteQRCode } from "@/services/qr";
import { QRCode } from "@/types";

export default function AdminQRManagement() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<QRCode | null>(null);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const { data: qrCodes = [], isLoading, isError, error } = useQRCodes();
  const deleteMutation = useDeleteQRCode();

  const handleDelete = (id: number | string) => {
    deleteMutation.mutate(id as number, {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: "QR Code deleted successfully",
          severity: "success",
        });
      },
      onError: (err) => {
        setSnackbar({
          open: true,
          message: `Error deleting QR Code: ${err.message}`,
          severity: "error",
        });
      },
    });
  };

  const handleView = (qrCode: QRCode) => {
    setSelectedQRCode(qrCode);
    setViewModalOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  const columns: GridColDef<QRCode>[] = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 90 },
      { field: "name", headerName: "Name", flex: 1 },
      { field: "points", headerName: "Points", width: 120 },
      {
        field: "created_at",
        headerName: "Created At",
        flex: 1,
        renderCell: (params) => format(new Date(params.value), "PPP p"),
      },
    ],
    [],
  );

  return (
    <>
      <AdminTemplate
        title="QR Code Management"
        data={qrCodes}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        error={error as { message: string } | null}
        onAdd={() => setAddModalOpen(true)}
        onDelete={handleDelete}
        onView={handleView}
        onSearchChange={() => {
          /* Search functionality can be added here */
        }}
        searchText=""
        addButtonLabel="Generate QR Code"
      />
      <AddQRCodeModal
        open={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
      <ViewQRCodeModal
        open={isViewModalOpen}
        onClose={() => setViewModalOpen(false)}
        qrCode={selectedQRCode}
      />
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
