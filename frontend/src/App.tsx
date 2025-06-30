import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { getMe } from "./services/auth.ts";
import PrivateRoute from "./components/PrivateRoute";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import DashboardPage from "./pages/DashboardPage";
import SignOutPage from "./pages/SignOutPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const { accessToken, setUser, logout } = useAuthStore();

  useEffect(() => {
    const checkUser = async () => {
      if (accessToken) {
        try {
          const user = await getMe();
          setUser(user);
        } catch (error) {
          logout();
        }
      }
    };
    checkUser();
  }, [accessToken, setUser, logout]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-out" element={<SignOutPage />} />

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
