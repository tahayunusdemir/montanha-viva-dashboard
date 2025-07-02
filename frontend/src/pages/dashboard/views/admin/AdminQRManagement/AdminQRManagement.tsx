import React from "react";
import AdminTemplate from "../components/AdminTemplate/AdminTemplate";

export default function AdminQRManagement() {
  return (
    <AdminTemplate
      title="QR Code Management"
      data={[]}
      columns={[]}
      isLoading={false}
      isError={false}
      onEdit={() => {}}
      onDelete={() => {}}
      onView={() => {}}
      onSearchChange={() => {}}
      searchText=""
      addButtonLabel="Generate QR Code"
    />
  );
}
