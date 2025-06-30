import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Container, Box, Typography, Button } from "@mui/material";

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Typography component="h1" variant="h4">
          Dashboard
        </Typography>
        {user ? (
          <Typography variant="h6">
            Welcome, {user.first_name} {user.last_name}!
          </Typography>
        ) : (
          <Typography variant="h6">Welcome!</Typography>
        )}
        <Button variant="contained" onClick={handleLogout}>
          Log Out
        </Button>
      </Box>
    </Container>
  );
};

export default DashboardPage;
