import React, { useState, useMemo } from "react";
import { GridColDef } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Chip,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { getUsers, deleteUser, updateUser, createUser } from "@/services/user";
import { AdminUser, UserUpdatePayload, CreateUserPayload } from "@/types/user";
import AdminTemplate from "../components/AdminTemplate/AdminTemplate";
import UserDetailsModal from "./components/UserDetailsModal";
import UserEditModal from "./components/UserEditModal";
import AddUserModal from "./components/AddUserModal";

export default function AdminUserManagement() {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setAddModalOpen(false);
      setNotification({
        message: "User created successfully.",
        severity: "success",
      });
    },
    onError: (error: any) => {
      // The error can be displayed inside the modal, so a notification might be redundant
      // Or you can still show a notification if you prefer
      console.error("Creation error:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setNotification({
        message: "User deleted successfully.",
        severity: "success",
      });
    },
    onError: (error: any) => {
      setNotification({
        message: `Error deleting user: ${
          error.response?.data?.detail || error.message
        }`,
        severity: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      handleCloseEditModal();
      setNotification({
        message: "User updated successfully.",
        severity: "success",
      });
    },
    onError: (error: any) => {
      setNotification({
        message: `Error updating user: ${
          error.response?.data?.detail || error.message
        }`,
        severity: "error",
      });
    },
  });

  const handleAdd = () => {
    setAddModalOpen(true);
  };

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDelete = (id: number | string) => {
    deleteMutation.mutate(Number(id));
  };

  const handleView = (user: AdminUser) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedUser(null);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUserUpdate = (payload: UserUpdatePayload) => {
    if (selectedUser) {
      updateMutation.mutate({ id: selectedUser.id, payload });
    }
  };

  const handleSaveNewUser = (payload: CreateUserPayload) => {
    createMutation.mutate(payload);
  };

  const filteredData = useMemo(() => {
    const users = data ?? [];
    let filteredUsers = users;

    if (roleFilter !== "All") {
      filteredUsers = filteredUsers.filter((user) => {
        if (roleFilter === "Super Admin") return user.role === "Super Admin";
        if (roleFilter === "Admin")
          return user.is_staff && user.role !== "Super Admin";
        if (roleFilter === "User") return !user.is_staff;
        return true;
      });
    }

    if (!searchText) return filteredUsers;

    return filteredUsers.filter(
      (user) =>
        user.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [data, searchText, roleFilter]);

  const columns: GridColDef<AdminUser>[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "first_name", headerName: "Name", flex: 1 },
    { field: "last_name", headerName: "Surname", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "role", headerName: "Role", flex: 0.5 },
    {
      field: "is_active",
      headerName: "Status",
      flex: 0.5,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          color={params.value ? "success" : "error"}
          size="small"
        />
      ),
    },
    {
      field: "date_joined",
      headerName: "Join Date",
      flex: 1,
      type: "dateTime",
      valueGetter: (value) => new Date(value),
      valueFormatter: (value: Date) =>
        value.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
    },
  ];

  const getApiErrorMessage = (err: any): string => {
    if (err && err.response && err.response.data) {
      const { data } = err.response;
      // Handle Django REST Framework validation errors
      if (typeof data === "object") {
        return Object.entries(data)
          .map(
            ([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(", ") : value}`,
          )
          .join(" ");
      }
      return String(data.detail || "An unexpected error occurred.");
    }
    return err.message || "An unknown error occurred.";
  };

  const creationError = createMutation.error
    ? { message: getApiErrorMessage(createMutation.error) }
    : null;

  const filterSlot = (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <FormLabel>Role</FormLabel>
      <Select
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
      >
        <MenuItem value="All">All</MenuItem>
        <MenuItem value="Super Admin">Super Admin</MenuItem>
        <MenuItem value="Admin">Admin</MenuItem>
        <MenuItem value="User">User</MenuItem>
      </Select>
    </FormControl>
  );

  return (
    <>
      {notification && (
        <Alert
          severity={notification.severity}
          onClose={() => setNotification(null)}
          sx={{ mb: 2 }}
        >
          {notification.message}
        </Alert>
      )}
      <AdminTemplate
        title="User Management"
        data={filteredData}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onSearch={setSearchText}
        isLoading={isLoading}
        isError={isError}
        error={error as { message: string } | null}
        addButtonLabel="Add User"
        filterSlot={filterSlot}
      />
      <UserDetailsModal
        open={isViewModalOpen}
        onClose={handleCloseViewModal}
        user={selectedUser}
      />
      <UserEditModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveUserUpdate}
        user={selectedUser}
        isSaving={updateMutation.isPending}
      />
      <AddUserModal
        open={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveNewUser}
        isSaving={createMutation.isPending}
        error={creationError}
      />
    </>
  );
}
