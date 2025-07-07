import React, { useState } from "react";
import { GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import AdminTemplate from "../components/AdminTemplate/AdminTemplate";
import AddEditRouteModal from "./components/AddEditRouteModal";
import ViewRouteDetails from "./components/ViewRouteDetails";
import { Route } from "@/types";
import { useRoutes, useDeleteRoute } from "@/services/routes";

export default function AdminRoutesManagement() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | undefined>(
    undefined,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: routesData,
    isLoading,
    isError,
    error,
  } = useRoutes({ search: searchTerm });

  const deleteRouteMutation = useDeleteRoute();

  const handleAdd = () => {
    setSelectedRoute(undefined);
    setModalOpen(true);
  };

  const handleEdit = (route: Route) => {
    setSelectedRoute(route);
    setModalOpen(true);
  };

  const handleDelete = (id: number | string) => {
    deleteRouteMutation.mutate(Number(id));
  };

  const handleView = (route: Route) => {
    setSelectedRoute(route);
    setViewModalOpen(true);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const columns: GridColDef<Route>[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "difficulty", headerName: "Difficulty", flex: 1 },
    {
      field: "distance_km",
      headerName: "Distance (km)",
      type: "number",
      flex: 1,
    },
    { field: "duration", headerName: "Duration", flex: 1 },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <AdminTemplate
        title="Routes Management"
        data={routesData || []}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onSearchChange={handleSearchChange}
        searchText={searchTerm}
        addButtonLabel="Add New Route"
      />
      <AddEditRouteModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        route={selectedRoute}
      />

      <Dialog
        open={isViewModalOpen}
        onClose={() => setViewModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedRoute && <ViewRouteDetails route={selectedRoute} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
