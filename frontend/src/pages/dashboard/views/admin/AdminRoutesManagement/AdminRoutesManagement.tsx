import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { Box, Typography, Tooltip, Snackbar, Alert } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

import PageLayout from "@/pages/dashboard/components/PageLayout";
import Header from "@/pages/dashboard/components/Header";
import {
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
} from "@/services/routes";
import { Route } from "@/types/routes";
import RouteToolbar from "./components/RouteToolbar";
import RouteModal from "./components/RouteModal";
import DeleteConfirmationDialog from "../AdminWikiManagement/components/DeleteConfirmationDialog";

export default function AdminRoutesManagement() {
  const queryClient = useQueryClient();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  const { data, isLoading } = useQuery({
    queryKey: ["routes", paginationModel, debouncedSearchText],
    queryFn: () =>
      getRoutes({
        page: paginationModel.page + 1,
        search: debouncedSearchText,
      }),
    placeholderData: (previousData) => previousData,
  });

  const createOrUpdateMutation = useMutation({
    mutationFn: (formData: FormData) => {
      if (selectedRoute) {
        return updateRoute(selectedRoute.id, formData);
      }
      return createRoute(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      setNotification({
        message: selectedRoute
          ? "Route updated successfully!"
          : "Route created successfully!",
        severity: "success",
      });
      handleCloseModal();
    },
    onError: () => {
      setNotification({
        message: selectedRoute
          ? "Failed to update route."
          : "Failed to create route.",
        severity: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      setNotification({
        message: "Route deleted successfully!",
        severity: "success",
      });
      handleCloseDeleteDialog();
    },
    onError: () => {
      setNotification({
        message: "Failed to delete route.",
        severity: "error",
      });
    },
  });

  const handleOpenModal = (route: Route | null = null) => {
    setSelectedRoute(route);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRoute(null);
  };

  const handleOpenDeleteDialog = (route: Route) => {
    setRouteToDelete(route);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setRouteToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (routeToDelete) {
      deleteMutation.mutate(routeToDelete.id);
    }
  };

  const handleSubmit = (formData: FormData) => {
    createOrUpdateMutation.mutate(formData);
  };

  const columns = useMemo(
    (): GridColDef<Route>[] => [
      { field: "id", headerName: "ID", width: 90 },
      { field: "name", headerName: "Name", flex: 1, minWidth: 200 },
      { field: "distance_km", headerName: "Distance (km)", width: 150 },
      { field: "duration", headerName: "Duration", width: 150 },
      { field: "difficulty", headerName: "Difficulty", width: 120 },
      { field: "route_type", headerName: "Type", width: 120 },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 100,
        getActions: ({ row }) => [
          <GridActionsCellItem
            icon={
              <Tooltip title="Edit Route">
                <Edit />
              </Tooltip>
            }
            label="Edit"
            onClick={() => handleOpenModal(row)}
          />,
          <GridActionsCellItem
            icon={
              <Tooltip title="Delete Route">
                <Delete />
              </Tooltip>
            }
            label="Delete"
            onClick={() => handleOpenDeleteDialog(row)}
          />,
        ],
      },
    ],
    [],
  );

  const rowCount = data?.count || 0;

  return (
    <PageLayout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Routes Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage all hiking routes in the system.
        </Typography>
      </Box>
      <Box sx={{ height: 650, width: "100%", mt: 4 }}>
        <DataGrid
          rows={data?.results || []}
          columns={columns}
          loading={
            isLoading ||
            createOrUpdateMutation.isPending ||
            deleteMutation.isPending
          }
          rowCount={rowCount}
          pageSizeOptions={[10, 25, 50]}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          slots={{
            toolbar: (props) => (
              <RouteToolbar
                {...props}
                onAddClick={() => handleOpenModal()}
                onSearchChange={(e) => setSearchText(e.target.value)}
                searchText={searchText}
              />
            ),
          }}
        />
      </Box>
      {isModalOpen && (
        <RouteModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          route={selectedRoute}
        />
      )}

      {routeToDelete && (
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          title="Delete Route"
          description={`Are you sure you want to delete "${routeToDelete.name}"? This action cannot be undone.`}
        />
      )}

      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotification(null)}
          severity={notification?.severity}
          sx={{ width: "100%" }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}
