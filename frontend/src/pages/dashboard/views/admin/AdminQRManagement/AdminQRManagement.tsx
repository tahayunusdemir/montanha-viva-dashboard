import React, { useState, useMemo } from "react";
import { GridColDef } from "@mui/x-data-grid";
import AdminTemplate from "../components/AdminTemplate/AdminTemplate";
import { Link } from "@mui/material";

// Mock Data
const mockQRCodes = [
  {
    id: "QR-GARD-01",
    name: "Gardunha Trail Head",
    linkedURL: "https://example.com/trails/gardunha-start",
    scanCount: 152,
    createdAt: new Date(2023, 4, 10),
  },
  {
    id: "QR-PLNT-OAK",
    name: "Ancient Oak Tree",
    linkedURL: "https://example.com/plants/ancient-oak",
    scanCount: 320,
    createdAt: new Date(2023, 6, 22),
  },
  {
    id: "QR-INFO-VIS",
    name: "Visitor Center Info",
    linkedURL: "https://example.com/visitor-center",
    scanCount: 89,
    createdAt: new Date(2024, 0, 5),
  },
];

type QRCode = (typeof mockQRCodes)[0];

export default function AdminQRManagement() {
  const [data, setData] = useState(mockQRCodes);
  const [searchText, setSearchText] = useState("");

  const handleAdd = () => alert("Placeholder for Generate QR Code modal.");
  const handleEdit = (item: QRCode) => alert(`Editing: ${item.name}`);
  const handleDelete = (id: number | string) =>
    setData((prev) => prev.filter((item) => item.id !== id));
  const handleView = (item: QRCode) => alert(`Viewing: ${item.name}`);

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [data, searchText]);

  const columns: GridColDef<QRCode>[] = [
    { field: "id", headerName: "QR ID", width: 150 },
    { field: "name", headerName: "Name", flex: 1.5 },
    {
      field: "linkedURL",
      headerName: "Linked URL",
      flex: 2,
      renderCell: (params) => (
        <Link href={params.value} target="_blank" rel="noopener">
          {params.value}
        </Link>
      ),
    },
    { field: "scanCount", headerName: "Scan Count", type: "number", flex: 0.5 },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1,
      type: "date",
      valueGetter: (value) => new Date(value),
    },
  ];

  return (
    <AdminTemplate
      title="QR Code Management"
      data={filteredData}
      columns={columns}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      onSearch={setSearchText}
      isLoading={false}
      isError={false}
      addButtonLabel="Generate QR Code"
    />
  );
}
