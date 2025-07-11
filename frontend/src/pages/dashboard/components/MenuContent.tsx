import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { Link, useLocation } from "react-router-dom";
import YardRoundedIcon from "@mui/icons-material/YardRounded";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import SensorsRoundedIcon from "@mui/icons-material/SensorsRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import FeedbackRoundedIcon from "@mui/icons-material/FeedbackRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import RouterRoundedIcon from "@mui/icons-material/RouterRounded";
import RouteRoundedIcon from "@mui/icons-material/RouteRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import { Divider } from "@mui/material";
import { useAuthStore } from "@/store/authStore";

const publicListItems = [
  { path: "/dashboard", text: "Home", icon: <HomeRoundedIcon /> },
  {
    path: "/dashboard/routes-encyclopedia",
    text: "Routes Encyclopedia",
    icon: <RouteRoundedIcon />,
  },
  {
    path: "/dashboard/flora-encyclopedia",
    text: "Flora Encyclopedia",
    icon: <LocalFloristIcon />,
  },
  {
    path: "/dashboard/plant-identifier",
    text: "Plant Identifier",
    icon: <YardRoundedIcon />,
  },
  {
    path: "/dashboard/qr-codes",
    text: "QR Codes",
    icon: <QrCodeScannerRoundedIcon />,
  },
  {
    path: "/dashboard/sensor-data",
    text: "Sensor Data",
    icon: <SensorsRoundedIcon />,
  },
];

const adminListItems = [
  {
    path: "/dashboard/admin/user-management",
    text: "User Management",
    icon: <PeopleRoundedIcon />,
  },
  {
    path: "/dashboard/admin/station-management",
    text: "Station Management",
    icon: <RouterRoundedIcon />,
  },
  {
    path: "/dashboard/admin/routes-management",
    text: "Routes Management",
    icon: <RouteRoundedIcon />,
  },
  {
    path: "/dashboard/admin/wiki-management",
    text: "Wiki Management",
    icon: <MenuBookIcon />,
  },
  {
    path: "/dashboard/admin/qr-management",
    text: "QR Management",
    icon: <QrCode2RoundedIcon />,
  },
  {
    path: "/dashboard/admin/feedback-management",
    text: "Feedback Management",
    icon: <RateReviewRoundedIcon />,
  },
];

const secondaryListItems = [
  {
    path: "/dashboard/profile",
    text: "Profile",
    icon: <AccountCircleRoundedIcon />,
  },
  { path: "/dashboard/about", text: "About", icon: <InfoRoundedIcon /> },
  {
    path: "/dashboard/points-and-rewards",
    text: "Points and Rewards",
    icon: <EmojiEventsRoundedIcon />,
  },
  {
    path: "/dashboard/send-feedback",
    text: "Send Feedback",
    icon: <FeedbackRoundedIcon />,
  },
];

export default function MenuContent() {
  const location = useLocation();
  const { user } = useAuthStore();
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {publicListItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {user?.is_staff && (
        <>
          <Divider />
          <List dense>
            {adminListItems.map((item) => (
              <ListItem
                key={item.path}
                disablePadding
                sx={{ display: "block" }}
              >
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
      <Divider />
      <List dense>
        {secondaryListItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
