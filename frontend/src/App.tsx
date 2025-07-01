import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "@/pages/home-page/HomePage";
import SignIn from "@/pages/sign-in/SignIn";
import SignUp from "@/pages/sign-up/SignUp";
import ResetPasswordPage from "@/pages/reset-password/ResetPasswordPage";
import Dashboard from "@/pages/dashboard/Dashboard";
import NotFoundPage from "@/pages/NotFoundPage";
import PrivateRoute from "@/components/PrivateRoute";
import AdminRoute from "@/components/AdminRoute";
import HomeView from "./pages/dashboard/views/public/HomeView/HomeView";
import About from "./pages/dashboard/views/public/About/About";
import PlantIdentifier from "./pages/dashboard/views/public/PlantIdentifier/PlantIdentifier";
import QRCodes from "./pages/dashboard/views/public/QRCodes/QRCodes";
import SensorData from "./pages/dashboard/views/public/SensorData/SensorData";
import PointsAndRewards from "./pages/dashboard/views/public/PointsAndRewards/PointsAndRewards";
import SendFeedback from "./pages/dashboard/views/public/SendFeedback/SendFeedback";
import NotificationHistory from "./pages/dashboard/views/public/NotificationHistory/NotificationHistory";
import Profile from "./pages/dashboard/views/public/Profile/Profile";
import RoutesEncyclopedia from "./pages/dashboard/views/public/RoutesEncyclopedia/RoutesEncyclopedia";
import FloraEncyclopedia from "./pages/dashboard/views/public/FloraEncyclopedia/FloraEncyclopedia";
import AdminUserManagement from "./pages/dashboard/views/admin/AdminUserManagement/AdminUserManagement";
import AdminStationManagament from "./pages/dashboard/views/admin/AdminStationManagament/AdminStationManagament";
import AdminQRManagement from "./pages/dashboard/views/admin/AdminQRManagement/AdminQRManagement";
import AdminNotificationManagement from "./pages/dashboard/views/admin/AdminNotificationManagement/AdminNotificationManagement";
import AdminFeedbackManagement from "./pages/dashboard/views/admin/AdminFeedbackManagement/AdminFeedbackManagement";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home-page" replace />} />
        <Route path="/home-page" element={<HomePage />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            {/* Publicly accessible dashboard routes */}
            <Route index element={<HomeView />} />
            <Route path="about" element={<About />} />
            <Route
              path="routes-encyclopedia"
              element={<RoutesEncyclopedia />}
            />
            <Route path="flora-encyclopedia" element={<FloraEncyclopedia />} />
            <Route path="plant-identifier" element={<PlantIdentifier />} />
            <Route path="qr-codes" element={<QRCodes />} />
            <Route path="sensor-data" element={<SensorData />} />
            <Route path="points-and-rewards" element={<PointsAndRewards />} />
            <Route path="send-feedback" element={<SendFeedback />} />
            <Route
              path="notification-history"
              element={<NotificationHistory />}
            />
            <Route path="profile" element={<Profile />} />

            {/* Admin-only routes */}
            <Route element={<AdminRoute />}>
              <Route
                path="admin/user-management"
                element={<AdminUserManagement />}
              />
              <Route
                path="admin/station-management"
                element={<AdminStationManagament />}
              />
              <Route
                path="admin/qr-management"
                element={<AdminQRManagement />}
              />
              <Route
                path="admin/notification-management"
                element={<AdminNotificationManagement />}
              />
              <Route
                path="admin/feedback-management"
                element={<AdminFeedbackManagement />}
              />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
