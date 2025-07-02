import * as React from "react";
import Stack from "@mui/material/Stack";
import NavbarBreadcrumbs from "./NavbarBreadcrumbs";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { useAuthStore } from "@/store/authStore";
import { Chip } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate } from "react-router-dom";
import { WeatherWidget } from "./WeatherWidget";

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handlePointsClick = () => {
    navigate("/dashboard/points-and-rewards");
  };

  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: "none", md: "flex" },
        width: "100%",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        maxWidth: { sm: "100%", md: "1700px" },
        pt: 1.5,
      }}
      spacing={2}
    >
      <NavbarBreadcrumbs />
      <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
        <WeatherWidget />
        <Chip
          icon={<StarIcon />}
          label={user?.points ?? 0}
          onClick={handlePointsClick}
          sx={{
            height: "2.25rem",
            "& .MuiChip-icon": {
              fontSize: "1rem",
            },
            cursor: "pointer",
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        />
        <ThemeToggleButton />
      </Stack>
    </Stack>
  );
}
