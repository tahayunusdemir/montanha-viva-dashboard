import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Lazy-loaded components
const HomePage = lazy(() => import("@/pages/home-page/HomePage"));
const SignIn = lazy(() => import("@/pages/sign-in/SignIn"));
const SignUp = lazy(() => import("@/pages/sign-up/SignUp"));
const ResetPasswordPage = lazy(
  () => import("@/pages/reset-password/ResetPasswordPage"),
);
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const PrivateRoute = lazy(() => import("@/components/PrivateRoute"));
const AdminRoute = lazy(() => import("@/components/AdminRoute"));
const HomeView = lazy(
  () => import("./pages/dashboard/views/public/HomeView/HomeView"),
);
const About = lazy(() => import("./pages/dashboard/views/public/About/About"));
const PlantIdentifier = lazy(
  () =>
    import("./pages/dashboard/views/public/PlantIdentifier/PlantIdentifier"),
);
const QRCodes = lazy(
  () => import("./pages/dashboard/views/public/QRCodes/QRCodes"),
);
const SensorData = lazy(
  () => import("./pages/dashboard/views/public/SensorData/SensorData"),
);
const PointsAndRewards = lazy(
  () =>
    import("./pages/dashboard/views/public/PointsAndRewards/PointsAndRewards"),
);
const SendFeedback = lazy(
  () => import("./pages/dashboard/views/public/SendFeedback/SendFeedback"),
);
const Profile = lazy(
  () => import("./pages/dashboard/views/public/Profile/Profile"),
);
const RoutesEncyclopedia = lazy(
  () =>
    import(
      "./pages/dashboard/views/public/RoutesEncyclopedia/RoutesEncyclopedia"
    ),
);
const FloraEncyclopedia = lazy(
  () =>
    import(
      "./pages/dashboard/views/public/FloraEncyclopedia/FloraEncyclopedia"
    ),
);
const AdminUserManagement = lazy(
  () =>
    import(
      "./pages/dashboard/views/admin/AdminUserManagement/AdminUserManagement"
    ),
);
const AdminStationManagament = lazy(
  () =>
    import(
      "./pages/dashboard/views/admin/AdminStationManagament/AdminStationManagament"
    ),
);
const AdminQRManagement = lazy(
  () =>
    import("./pages/dashboard/views/admin/AdminQRManagement/AdminQRManagement"),
);
const AdminFeedbackManagement = lazy(
  () =>
    import(
      "./pages/dashboard/views/admin/AdminFeedbackManagement/AdminFeedbackManagement"
    ),
);
const AdminRoutesManagement = lazy(
  () =>
    import(
      "./pages/dashboard/views/admin/AdminRoutesManagement/AdminRoutesManagement"
    ),
);
const AdminWikiManagement = lazy(
  () =>
    import(
      "./pages/dashboard/views/admin/AdminWikiManagement/AdminWikiManagement"
    ),
);

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
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
              <Route
                path="flora-encyclopedia"
                element={<FloraEncyclopedia />}
              />
              <Route path="plant-identifier" element={<PlantIdentifier />} />
              <Route path="qr-codes" element={<QRCodes />} />
              <Route path="sensor-data" element={<SensorData />} />
              <Route path="points-and-rewards" element={<PointsAndRewards />} />
              <Route path="send-feedback" element={<SendFeedback />} />
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
                  path="admin/feedback-management"
                  element={<AdminFeedbackManagement />}
                />
                <Route
                  path="admin/routes-management"
                  element={<AdminRoutesManagement />}
                />
                <Route
                  path="admin/wiki-management"
                  element={<AdminWikiManagement />}
                />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
