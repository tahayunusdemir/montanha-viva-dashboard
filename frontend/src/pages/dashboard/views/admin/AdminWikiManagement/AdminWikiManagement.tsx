import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
} from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PageLayout from "@/pages/dashboard/components/PageLayout";
import { Plant } from "@/types/flora";
import {
  getPlants,
  createPlant,
  updatePlant,
  deletePlant,
} from "@/services/flora";
import PlantToolbar from "./components/PlantToolbar";
import PlantModal, { PlantFormData } from "./components/PlantModal";
import DeleteConfirmationDialog from "./components/DeleteConfirmationDialog";

export default function AdminWikiManagement() {
  const queryClient = useQueryClient();

  // State for modal, deletion dialog, search, and notifications
  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedPlant, setSelectedPlant] = React.useState<Plant | null>(null);
  const [plantToDelete, setPlantToDelete] = React.useState<Plant | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [notification, setNotification] = React.useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  // Fetching data with react-query
  const {
    data: plants,
    isLoading: isLoadingPlants,
    error,
  } = useQuery<Plant[], Error>({
    queryKey: ["plants", searchQuery],
    queryFn: () => getPlants(), // In a real app, you'd pass searchQuery to getPlants
  });

  // Mutation for creating a plant
  const createPlantMutation = useMutation({
    mutationFn: createPlant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plants"] });
      setNotification({
        message: "Plant created successfully!",
        severity: "success",
      });
      handleCloseModal();
    },
    onError: () => {
      setNotification({
        message: "Failed to create plant.",
        severity: "error",
      });
    },
  });

  // Mutation for updating a plant
  const updatePlantMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PlantFormData> }) =>
      updatePlant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plants"] });
      setNotification({
        message: "Plant updated successfully!",
        severity: "success",
      });
      handleCloseModal();
    },
    onError: () => {
      setNotification({
        message: "Failed to update plant.",
        severity: "error",
      });
    },
  });

  // Mutation for deleting a plant
  const deletePlantMutation = useMutation({
    mutationFn: deletePlant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plants"] });
      setNotification({
        message: "Plant deleted successfully!",
        severity: "success",
      });
      handleCloseDeleteDialog();
    },
    onError: () => {
      setNotification({
        message: "Failed to delete plant.",
        severity: "error",
      });
    },
  });

  // Modal and Dialog handlers
  const handleOpenModal = (plant: Plant | null = null) => {
    setSelectedPlant(plant);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setSelectedPlant(null);
    setModalOpen(false);
  };
  const handleOpenDeleteDialog = (plant: Plant) => {
    setPlantToDelete(plant);
    setDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => {
    setPlantToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (plantToDelete) {
      deletePlantMutation.mutate(plantToDelete.id);
    }
  };

  const handleFormSubmit = (data: PlantFormData) => {
    if (selectedPlant) {
      updatePlantMutation.mutate({ id: selectedPlant.id, data });
    } else {
      createPlantMutation.mutate(data);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredPlants = React.useMemo(() => {
    return (
      plants?.filter(
        (plant) =>
          plant.scientific_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          plant.common_names.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ?? []
    );
  }, [plants, searchQuery]);

  // DataGrid columns definition
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "scientific_name", headerName: "Scientific Name", flex: 1 },
    { field: "common_names", headerName: "Common Names", flex: 1 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="Edit">
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => handleOpenModal(row)}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Delete">
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleOpenDeleteDialog(row)}
        />,
      ],
    },
  ];

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom>
        Admin Wiki Management
      </Typography>
      {error && (
        <Alert severity="error">Failed to load plants: {error.message}</Alert>
      )}
      <Box sx={{ height: 600, width: "100%", mt: 2 }}>
        <DataGrid
          rows={filteredPlants}
          columns={columns}
          loading={isLoadingPlants}
          slots={{
            toolbar: () => (
              <PlantToolbar
                onAddPlant={() => handleOpenModal(null)}
                onSearchChange={handleSearchChange}
                searchQuery={searchQuery}
              />
            ),
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Box>

      {/* Modal for Create/Edit */}
      <PlantModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        plant={selectedPlant}
        isLoading={
          createPlantMutation.isPending || updatePlantMutation.isPending
        }
      />

      {/* Dialog for Delete Confirmation */}
      {plantToDelete && (
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          title="Delete Plant"
          description={`Are you sure you want to delete "${plantToDelete.scientific_name}"? This action cannot be undone.`}
        />
      )}

      {/* Notification Snackbar */}
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
