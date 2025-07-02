import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Snackbar, Alert } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";

import AdminTemplate from "../components/AdminTemplate/AdminTemplate";
import AddEditPlantModal from "./components/AddEditPlantModal";
import PlantDetailsModal from "./components/PlantDetailsModal";
import floraService from "@/services/flora";
import { Plant, PlantPayload } from "@/types";

type PlantWithId = Plant & { id: number };

export default function AdminWikiManagement() {
  const queryClient = useQueryClient();
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [searchText, setSearchText] = useState("");
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const {
    data: plants,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["plants"],
    queryFn: floraService.getPlants,
    refetchOnWindowFocus: false,
  });

  const filteredPlants = useMemo(() => {
    const allPlants = plants || [];
    if (!searchText) {
      return allPlants;
    }
    const searchLower = searchText.toLowerCase();
    return allPlants.filter(
      (plant) =>
        plant.scientific_name.toLowerCase().includes(searchLower) ||
        plant.common_names.toLowerCase().includes(searchLower)
    );
  }, [plants, searchText]);

  const createMutation = useMutation({
    mutationFn: floraService.createPlant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plants"] });
      setNotification({ open: true, message: "Plant created successfully!", severity: "success" });
      handleAddEditModalClose();
    },
    onError: (e: any) => {
      setNotification({ open: true, message: e.response?.data?.detail || "Failed to create plant.", severity: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PlantPayload }) =>
      floraService.updatePlant({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plants"] });
      setNotification({ open: true, message: "Plant updated successfully!", severity: "success" });
      handleAddEditModalClose();
    },
    onError: (e: any) => {
      setNotification({ open: true, message: e.response?.data?.detail || "Failed to update plant.", severity: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: floraService.deletePlant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plants"] });
      setNotification({ open: true, message: "Plant deleted successfully!", severity: "success" });
    },
    onError: (e: any) => {
      setNotification({ open: true, message: e.response?.data?.detail || "Failed to delete plant.", severity: "error" });
    },
  });

  const handleAddEditModalOpen = (plant: PlantWithId | null = null) => {
    setSelectedPlant(plant);
    setAddEditModalOpen(true);
  };

  const handleAddEditModalClose = () => {
    setSelectedPlant(null);
    setAddEditModalOpen(false);
  };

  const handleViewDetailsOpen = (plant: PlantWithId) => {
    setSelectedPlant(plant);
    setViewModalOpen(true);
  };

  const handleViewDetailsClose = () => {
    setSelectedPlant(null);
    setViewModalOpen(false);
  };

  const handleSavePlant = (data: PlantPayload) => {
    if (selectedPlant) {
      updateMutation.mutate({ id: selectedPlant.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns: GridColDef<PlantWithId>[] = [
    { field: "scientific_name", headerName: "Scientific Name", flex: 1.5 },
    { field: "common_names", headerName: "Common Names", flex: 2 },
    {
      field: "images",
      headerName: "Images",
      flex: 0.5,
      renderCell: (params) => params.row.images?.length || 0,
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1,
      renderCell: (params) => {
        if (!params.value) return "";
        return dayjs(params.value as string).format("YYYY-MM-DD HH:mm");
      },
    },
  ];

  return (
    <>
      <AdminTemplate
        title="Wiki Management"
        data={filteredPlants}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onAdd={() => handleAddEditModalOpen()}
        onEdit={handleAddEditModalOpen}
        onDelete={(id) => deleteMutation.mutate(id as number)}
        onView={handleViewDetailsOpen}
        addButtonLabel="Add New Plant"
        searchText={searchText}
        onSearchChange={setSearchText}
      />
      <AddEditPlantModal
        open={addEditModalOpen}
        onClose={handleAddEditModalClose}
        onSubmit={handleSavePlant}
        plant={selectedPlant}
      />
      <PlantDetailsModal
        open={viewModalOpen}
        onClose={handleViewDetailsClose}
        plant={selectedPlant}
      />
      {notification && (
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setNotification(null)}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </>
  );
}
