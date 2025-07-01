import React, { useState, useMemo, useEffect } from "react";
import {
  Chip,
  SelectChangeEvent,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import {
  useFeedback,
  useUpdateFeedback,
  useDeleteFeedback,
} from "@/services/feedback";
import { Feedback, FeedbackStatus } from "@/types/feedback";
import AdminTemplate from "../components/AdminTemplate/AdminTemplate";
import FeedbackDetailsModal from "./components/FeedbackDetailsModal";
import EditFeedbackModal from "./components/EditFeedbackModal";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

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
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "">("");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => clearTimeout(handler);
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

  const handleCloseModals = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
    setSelectedFeedback(null);
  };

  const handleDelete = (id: number | string) => {
    deleteFeedbackMutation.mutate(id as number);
  };

  const handleStatusChange = (event: SelectChangeEvent<FeedbackStatus>) => {
    if (selectedFeedback) {
      const newStatus = event.target.value as FeedbackStatus;
      updateFeedbackMutation.mutate(
        { id: selectedFeedback.id, payload: { status: newStatus } },
        { onSuccess: handleCloseModals },
      );
    }
  };

  const columns = useMemo(
    (): GridColDef<Feedback>[] => [
      {
        field: "fullName",
        headerName: "User",
        flex: 1.5,
        valueGetter: (_value, row) =>
          `${row.user_details?.first_name || row.name || ""} ${
            row.user_details?.last_name || row.surname || ""
          }`.trim() || "N/A",
      },
      {
        field: "email",
        headerName: "Email",
        flex: 2,
        valueGetter: (_value, row) =>
          row.user_details?.email || row.email || "N/A",
      },
      { field: "subject", headerName: "Subject", flex: 2 },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        renderCell: (params) => {
          const status = params.value as FeedbackStatus;
          return status ? (
            <Chip
              label={status.replace("_", " ").toUpperCase()}
              color={statusColors[status] || "default"}
              size="small"
            />
          ) : (
            <Chip label="N/A" size="small" />
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <AdminTemplate
        title="Admin Feedback Management"
        data={feedbackList}
        columns={columns}
        isLoading={
          isLoading ||
          updateFeedbackMutation.isPending ||
          deleteFeedbackMutation.isPending
        }
        isError={isError}
        error={error}
        onAdd={() => {
          /* Placeholder for future add functionality */
        }}
        onEdit={handleEditOpen}
        onDelete={handleDelete}
        onView={handleViewOpen}
        addButtonLabel="Add Feedback"
        deleteConfirmationText="Are you sure you want to delete this feedback? This action cannot be undone."
        onSearch={setSearchText}
        filterSlot={
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) =>
                setStatusFilter(e.target.value as FeedbackStatus | "")
              }
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
        }
      />

      <FeedbackDetailsModal
        open={isViewModalOpen}
        onClose={handleCloseModals}
        feedback={selectedFeedback}
      />

      <EditFeedbackModal
        open={isEditModalOpen}
        onClose={handleCloseModals}
        feedback={selectedFeedback}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
