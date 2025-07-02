import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Chip, Snackbar, Alert, FormControl, FormLabel } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import dayjs from "dayjs";

import AdminTemplate from "../components/AdminTemplate/AdminTemplate";
import AddEditStationModal from "./components/AddEditStationModal";
import StationDetailsModal from "./components/StationDetailsModal";
import stationService from "@/services/station";
import { Station, StationPayload } from "@/types";

type StationWithId = Station & { id: string };

function AdminStationManagament() {
  const queryClient = useQueryClient();
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [searchText, setSearchText] = useState("");
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const {
    data: stations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["stations"],
    queryFn: stationService.getStations,
    refetchOnWindowFocus: false,
  });

  const stationDataForGrid = useMemo((): StationWithId[] => {
    return stations ? stations.map((s) => ({ ...s, id: s.station_id })) : [];
  }, [stations]);

  const filteredStations = useMemo(() => {
    if (!searchText) {
      return stationDataForGrid;
    }
    return stationDataForGrid.filter((station) => {
      const searchLower = searchText.toLowerCase();
      return (
        station.name.toLowerCase().includes(searchLower) ||
        (station.location &&
          station.location.toLowerCase().includes(searchLower)) ||
        station.station_id.toLowerCase().includes(searchLower)
      );
    });
  }, [stationDataForGrid, searchText]);

  const createMutation = useMutation({
    mutationFn: stationService.createStation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      setNotification({
        open: true,
        message: "Station created successfully!",
        severity: "success",
      });
      handleAddEditModalClose();
    },
    onError: (error: any) => {
      setNotification({
        open: true,
        message:
          error.response?.data?.station_id?.[0] || "Failed to create station.",
        severity: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      stationId,
      data,
    }: {
      stationId: string;
      data: StationPayload;
    }) => stationService.updateStation(stationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      setNotification({
        open: true,
        message: "Station updated successfully!",
        severity: "success",
      });
      handleAddEditModalClose();
    },
    onError: () => {
      setNotification({
        open: true,
        message: "Failed to update station.",
        severity: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: stationService.deleteStation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      setNotification({
        open: true,
        message: "Station deleted successfully!",
        severity: "success",
      });
    },
    onError: () => {
      setNotification({
        open: true,
        message: "Failed to delete station.",
        severity: "error",
      });
    },
  });

  const handleAddEditModalOpen = (station: StationWithId | null = null) => {
    setSelectedStation(station);
    setAddEditModalOpen(true);
  };

  const handleAddEditModalClose = () => {
    setSelectedStation(null);
    setAddEditModalOpen(false);
  };

  const handleViewDetailsOpen = (station: StationWithId) => {
    setSelectedStation(station);
    setViewModalOpen(true);
  };

  const handleViewDetailsClose = () => {
    setSelectedStation(null);
    setViewModalOpen(false);
  };

  const handleSaveStation = (data: StationPayload) => {
    if (selectedStation) {
      updateMutation.mutate({ stationId: selectedStation.station_id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns: GridColDef<StationWithId>[] = [
    { field: "station_id", headerName: "Station ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
    {
      field: "is_active",
      headerName: "Status",
      flex: 0.5,
      renderCell: (params: GridRenderCellParams<StationWithId>) => (
        <Chip
          label={params.row.is_active ? "Active" : "Inactive"}
          color={params.row.is_active ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1,
      renderCell: (params: GridRenderCellParams<StationWithId>) => {
        if (!params.value) return "";
        return dayjs(params.value as string).format("YYYY-MM-DD HH:mm");
      },
    },
  ];

  return (
    <>
      <AdminTemplate
        title="Station Management"
        data={filteredStations}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onAdd={() => handleAddEditModalOpen()}
        onEdit={handleAddEditModalOpen}
        onDelete={(id) => deleteMutation.mutate(id as string)}
        onView={handleViewDetailsOpen}
        addButtonLabel="Add New Station"
        searchText={searchText}
        onSearchChange={setSearchText}
      />
      <AddEditStationModal
        open={addEditModalOpen}
        onClose={handleAddEditModalClose}
        onSubmit={handleSaveStation}
        station={selectedStation}
      />
      <StationDetailsModal
        open={viewModalOpen}
        onClose={handleViewDetailsClose}
        station={selectedStation}
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

export default AdminStationManagament;
