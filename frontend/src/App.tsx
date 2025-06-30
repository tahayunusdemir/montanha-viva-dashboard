import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home-page/HomePage";
import "./App.css";
import SignUp from "./pages/sign-up/SignUp.tsx";
import SignIn from "./pages/sign-in/SignIn.tsx";
import Dashboard from "./pages/dashboard/Dashboard.tsx";
import SignOutPage from "./pages/SignOutPage";
import NotFoundPage from "./pages/NotFoundPage";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { getMe } from "./services/auth.ts";
import PrivateRoute from "./components/PrivateRoute";

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
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-out" element={<SignOutPage />} />

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
