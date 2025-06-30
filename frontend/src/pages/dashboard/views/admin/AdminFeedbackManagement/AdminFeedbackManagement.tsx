import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  SelectChangeEvent,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  useFeedback,
  useUpdateFeedback,
  useDeleteFeedback,
} from "@/services/feedback";
import { Feedback, FeedbackStatus } from "@/types/feedback";
import PageLayout from "@/pages/dashboard/components/PageLayout";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import FeedbackToolbar from "./components/FeedbackToolbar";
import FeedbackDetailsModal from "./components/FeedbackDetailsModal";
import EditFeedbackModal from "./components/EditFeedbackModal";
import DeleteFeedbackDialog from "./components/DeleteFeedbackDialog";

const statusColors: {
  [key in FeedbackStatus]: "default" | "info" | "success" | "warning";
} = {
  pending: "warning",
  in_progress: "info",
  resolved: "success",
  closed: "default",
};

export default function AdminFeedbackManagement() {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null,
  );
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "">("");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  const {
    data: feedbackList = [],
    isLoading,
    isError,
    error,
  } = useFeedback({
    status: statusFilter,
    search: debouncedSearchText,
  });

  const updateFeedbackMutation = useUpdateFeedback();
  const deleteFeedbackMutation = useDeleteFeedback();

  const handleViewOpen = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setViewModalOpen(true);
  };

  const handleEditOpen = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setEditModalOpen(true);
  };

  const handleDeleteOpen = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setDeleteConfirmOpen(true);
  };

  const handleClose = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
    setDeleteConfirmOpen(false);
    setSelectedFeedback(null);
  };

  const handleStatusChange = (event: SelectChangeEvent<FeedbackStatus>) => {
    if (selectedFeedback) {
      const newStatus = event.target.value as FeedbackStatus;
      updateFeedbackMutation.mutate(
        { id: selectedFeedback.id, payload: { status: newStatus } },
        { onSuccess: handleClose },
      );
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedFeedback) {
      deleteFeedbackMutation.mutate(selectedFeedback.id, {
        onSuccess: handleClose,
      });
    }
  };

  const columns = useMemo(
    (): GridColDef<Feedback>[] => [
      {
        field: "fullName",
        headerName: "User",
        flex: 1.5,
        valueGetter: (value, row) => {
          if (row.user_details) {
            return `${row.user_details.first_name || ""} ${row.user_details.last_name || ""}`.trim();
          }
          return `${row.name || ""} ${row.surname || ""}`.trim() || "N/A";
        },
      },
      {
        field: "email",
        headerName: "Email",
        flex: 2,
        valueGetter: (value, row) =>
          row.user_details?.email || row.email || "N/A",
      },
      { field: "subject", headerName: "Subject", flex: 2 },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        renderCell: (params) => {
          const status = params.value as FeedbackStatus;
          if (!status) {
            return <Chip label="N/A" size="small" />;
          }
          return (
            <Chip
              label={status.replace("_", " ").toUpperCase()}
              color={statusColors[status] || "default"}
              size="small"
            />
          );
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Box>
            <Tooltip title="View Details">
              <IconButton onClick={() => handleViewOpen(params.row)}>
                <Visibility />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Status">
              <IconButton onClick={() => handleEditOpen(params.row)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Feedback">
              <IconButton onClick={() => handleDeleteOpen(params.row)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <CircularProgress />;
  if (isError)
    return (
      <Alert severity="error">Error fetching feedback: {error.message}</Alert>
    );

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom>
        Admin Feedback Management
      </Typography>
      <Paper sx={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={feedbackList}
          columns={columns}
          loading={
            isLoading ||
            updateFeedbackMutation.isPending ||
            deleteFeedbackMutation.isPending
          }
          slots={{
            toolbar: () => (
              <FeedbackToolbar
                searchText={searchText}
                onSearchTextChange={setSearchText}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />
            ),
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </Paper>

      <FeedbackDetailsModal
        open={isViewModalOpen}
        onClose={handleClose}
        feedback={selectedFeedback}
      />

      <EditFeedbackModal
        open={isEditModalOpen}
        onClose={handleClose}
        feedback={selectedFeedback}
        onStatusChange={handleStatusChange}
      />

      <DeleteFeedbackDialog
        open={isDeleteConfirmOpen}
        onClose={handleClose}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  );
}
