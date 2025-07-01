import React, { useState, useMemo } from "react";
import { GridColDef } from "@mui/x-data-grid";
import AdminTemplate from "../components/AdminTemplate/AdminTemplate";

// Mock Data
const mockNotifications = [
  {
    id: 1,
    title: "System Maintenance Alert",
    targetAudience: "All Users",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
  },
  {
    id: 2,
    title: "New Feature: Plant Identification",
    targetAudience: "Beta Testers",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
  {
    id: 3,
    title: "Welcome to Montanha Viva!",
    targetAudience: "New Users",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
  },
];

type Notification = (typeof mockNotifications)[0];

export default function AdminNotificationManagement() {
  const [data, setData] = useState(mockNotifications);
  const [searchText, setSearchText] = useState("");

  const handleAdd = () => alert("Placeholder for Send Notification modal.");
  const handleEdit = (item: Notification) => alert(`Editing: ${item.title}`);
  const handleDelete = (id: number | string) =>
    setData((prev) => prev.filter((item) => item.id !== id));
  const handleView = (item: Notification) => alert(`Viewing: ${item.title}`);

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data.filter((item) =>
      item.title.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [data, searchText]);

  const columns: GridColDef<Notification>[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "title", headerName: "Title", flex: 1.5 },
    { field: "targetAudience", headerName: "Target Audience", flex: 1 },
    {
      field: "sentAt",
      headerName: "Sent At",
      flex: 1,
      type: "dateTime",
      valueGetter: (value) => new Date(value),
    },
  ];

  return (
    <AdminTemplate
      title="Notification Management"
      data={filteredData}
      columns={columns}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      onSearch={setSearchText}
      isLoading={false}
      isError={false}
      addButtonLabel="Send Notification"
    />
  );
}
