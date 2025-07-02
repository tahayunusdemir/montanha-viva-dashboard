import React from "react";
import AdminTemplate from "../components/AdminTemplate/AdminTemplate";

export default function AdminNotificationManagement() {
  return (
    <AdminTemplate
      title="Notification Management"
      data={[]}
      columns={[]}
      isLoading={false}
      isError={false}
      onEdit={() => {}}
      onDelete={() => {}}
      onView={() => {}}
      onSearchChange={() => {}}
      searchText=""
      addButtonLabel="Send Notification"
    />
  );
}
