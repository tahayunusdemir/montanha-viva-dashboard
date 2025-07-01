import React, { useState, useMemo } from "react";
import { GridColDef } from "@mui/x-data-grid";
import AdminTemplate from "../components/AdminTemplate/AdminTemplate";
import { Chip } from "@mui/material";

// Mock Data
const mockStations = [
  {
    id: "STN-001",
    name: "Gardunha Weather Station",
    location: "40.08, -7.53",
    status: "Online",
    lastPing: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
  {
    id: "STN-002",
    name: "Valley Monitoring Post",
    location: "40.10, -7.55",
    status: "Offline",
    lastPing: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "STN-003",
    name: "River Water Sensor",
    location: "40.09, -7.51",
    status: "Maintenance",
    lastPing: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
];

type Station = (typeof mockStations)[0];

export default function AdminStationManagament() {
  const [data, setData] = useState(mockStations);
  const [searchText, setSearchText] = useState("");

  const handleAdd = () => alert("Placeholder for Add Station modal.");
  const handleEdit = (item: Station) => alert(`Editing: ${item.name}`);
  const handleDelete = (id: number | string) =>
    setData((prev) => prev.filter((item) => item.id !== id));
  const handleView = (item: Station) => alert(`Viewing: ${item.name}`);

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [data, searchText]);

  const columns: GridColDef<Station>[] = [
    { field: "id", headerName: "Station ID", width: 120 },
    { field: "name", headerName: "Name", flex: 1.5 },
    { field: "location", headerName: "Location (Lat, Lng)", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      renderCell: (params) => {
        const status = params.value as string;
        let color: "success" | "error" | "warning" = "warning";
        if (status === "Online") color = "success";
        if (status === "Offline") color = "error";
        return <Chip label={status} color={color} size="small" />;
      },
    },
    {
      field: "lastPing",
      headerName: "Last Ping",
      flex: 1,
      type: "dateTime",
      valueGetter: (value) => new Date(value),
    },
  ];

  return (
    <AdminTemplate
      title="Station Management"
      data={filteredData}
      columns={columns}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      onSearch={setSearchText}
      isLoading={false}
      isError={false}
      addButtonLabel="Add Station"
    />
  );
}
