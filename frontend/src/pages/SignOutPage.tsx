import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const SignOutPage = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    logout();
    navigate("/sign-in");
  }, [logout, navigate]);

  return null;
};

export default SignOutPage;
