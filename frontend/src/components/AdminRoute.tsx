import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const AdminRoute = () => {
  const { user } = useAuthStore();

  // This component should be used inside a PrivateRoute,
  // so `isAuthenticated` is implicitly true.
  return user?.is_staff ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
