import * as React from "react";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Breadcrumbs, { breadcrumbsClasses } from "@mui/material/Breadcrumbs";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import { Link, useLocation } from "react-router-dom";

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: "center",
  },
}));

const routeNameMapping: { [key: string]: string } = {
  analytics: "Analytics",
  clients: "Clients",
  tasks: "Tasks",
  settings: "Settings",
  about: "About",
  feedback: "Feedback",
};

export default function NavbarBreadcrumbs() {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter((i) => i);

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Link
        to="/dashboard"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Typography variant="body1">Dashboard</Typography>
      </Link>
      {pathParts.length > 1 ? (
        <Typography
          variant="body1"
          sx={{ color: "text.primary", fontWeight: 600 }}
        >
          {routeNameMapping[pathParts[1]] || "Home"}
        </Typography>
      ) : (
        <Typography
          variant="body1"
          sx={{ color: "text.primary", fontWeight: 600 }}
        >
          Home
        </Typography>
      )}
    </StyledBreadcrumbs>
  );
}
