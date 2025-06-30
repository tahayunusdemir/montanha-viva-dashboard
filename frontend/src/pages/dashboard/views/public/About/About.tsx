import * as React from "react";
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  Link,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  Divider,
  IconButton,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";

// Icons
import BarChartIcon from "@mui/icons-material/BarChart";
import EmailIcon from "@mui/icons-material/Email";
import GroupsIcon from "@mui/icons-material/Groups";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PublicIcon from "@mui/icons-material/Public";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import SecurityIcon from "@mui/icons-material/Security";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DataObjectIcon from "@mui/icons-material/DataObject";
import MobileFriendlyIcon from "@mui/icons-material/MobileFriendly";
import LaunchIcon from "@mui/icons-material/Launch";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import GardunhaImage from "@/assets/gardunha.jpg";
import PageLayout from "@/pages/dashboard/components/PageLayout";

const teamMembers = [
  {
    name: "Taha Yunus Demir",
    role: "Lead Developer",
    avatar: "/static/images/avatar/2.jpg",
    link: "https://www.linkedin.com/in/taha-yunus-demir/",
  },
  {
    name: "Nuno Pereira",
    role: "Project Advisor",
    avatar: "/static/images/avatar/1.jpg",
    link: "https://www.linkedin.com/in/nuno-pereira-9851211b5/",
  },
];

const keyFeatures = [
  {
    text: "Real-time data sync",
    icon: <PublicIcon />,
  },
  {
    text: "Image analysis & subject detection",
    icon: <ImageSearchIcon />,
  },
  {
    text: "Gamification & point-based rewards",
    icon: <SportsEsportsIcon />,
  },
  {
    text: "Interactive charts and visualizations",
    icon: <BarChartIcon />,
  },
  {
    text: "Secure data handling",
    icon: <SecurityIcon />,
  },
  {
    text: "Advanced Administration Panel",
    icon: <AdminPanelSettingsIcon />,
  },
];

export default function AboutView() {
  const theme = useTheme();
  const cardStyle = {
    height: "100%",
    borderLeft: 4,
    boxShadow: theme.shadows[1],
  };

  return (
    <PageLayout>
      <Box sx={{ bgcolor: "background.default", py: 5 }}>
        <Container maxWidth="lg">
          <Card
            sx={{
              borderRadius: Number(theme.shape.borderRadius) / 2,
              boxShadow: theme.shadows[4],
              mb: 5,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "relative",
                height: "400px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
                textAlign: "center",
                p: 3,
                // Use background image for robust layout
                backgroundImage: `url(${GardunhaImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: alpha(theme.palette.grey[900], 0.5),
                  zIndex: 1,
                },
                "& > *": {
                  position: "relative",
                  zIndex: 2,
                },
              }}
            >
              <Box>
                <Typography
                  variant="h2"
                  component="h1"
                  fontWeight="bold"
                  gutterBottom
                >
                  About The Montanha Viva Project
                </Typography>
                <Typography variant="h5" component="p">
                  A pioneering initiative bringing together technology, nature,
                  and community.
                </Typography>
              </Box>
            </Box>
          </Card>

          <Grid container spacing={4}>
            {/* Introduction & Purpose */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ ...cardStyle, borderColor: "primary.main" }}>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Introduction
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Montanha Viva is an initiative that blends nature with
                    technology, working for the benefit of the community through
                    innovative projects that support sustainable development.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ ...cardStyle, borderColor: "primary.main" }}>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Project Purpose
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    This project involves the development of an online dashboard
                    aimed at real-time visualization and management of data
                    collected from IoT devices.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Key Features */}
          <Box sx={{ textAlign: "center", my: 5 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Key Features
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: "750px", mx: "auto" }}
            >
              Discover the core functionalities that make our platform powerful
              and user-friendly.
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {keyFeatures.map((feature) => (
              <Grid key={feature.text} size={{ xs: 12, sm: 6, md: 4 }}>
                <Stack alignItems="center" spacing={2} textAlign="center">
                  <Avatar
                    sx={{
                      bgcolor: "primary.light",
                      color: "primary.dark",
                      width: 64,
                      height: 64,
                    }}
                  >
                    {React.cloneElement(feature.icon, { fontSize: "large" })}
                  </Avatar>
                  <Typography variant="h6">{feature.text}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={4} sx={{ mt: 2 }} alignItems="stretch">
            {/* Objectives and Vision */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={4}>
                <Card sx={{ ...cardStyle, borderColor: "info.main" }}>
                  <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                      <VisibilityIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                      Our Objectives
                    </Typography>
                    <Stack spacing={3} sx={{ mt: 3 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{ bgcolor: "info.light", color: "info.dark" }}
                        >
                          <DataObjectIcon />
                        </Avatar>
                        <ListItemText
                          primary="Unified Data Platform"
                          secondary="Aggregating various data types (text, numeric, multimedia) into a single platform."
                        />
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{ bgcolor: "info.light", color: "info.dark" }}
                        >
                          <SportsEsportsIcon />
                        </Avatar>
                        <ListItemText
                          primary="Gamification and Engagement"
                          secondary="Enhancing user interaction and engagement via QR codes and rewards."
                        />
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{ bgcolor: "info.light", color: "info.dark" }}
                        >
                          <MobileFriendlyIcon />
                        </Avatar>
                        <ListItemText
                          primary="Responsive Interface"
                          secondary="Designing a user-friendly, mobile-responsive web interface for all devices."
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
                <Card sx={{ ...cardStyle, borderColor: "success.main" }}>
                  <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                      <RocketLaunchIcon
                        sx={{ mr: 1, verticalAlign: "middle" }}
                      />
                      Future Vision
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      To offer an open-source version of the system, collaborate
                      with broader communities, and promote similar
                      implementations in different regions.
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 2, fontStyle: "italic" }}
                    >
                      We are committed to continuous improvement and fostering a
                      community around sustainable technology.
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            {/* Team & Contact */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={4}>
                <Card sx={{ ...cardStyle, borderColor: "primary.main" }}>
                  <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                      <GroupsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                      Meet the Team
                    </Typography>
                    <Stack spacing={2} mt={2} divider={<Divider flexItem />}>
                      {teamMembers.map((member) => (
                        <Stack
                          key={member.name}
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          sx={{ pt: 1 }}
                        >
                          <Avatar alt={member.name} src={member.avatar} />
                          <ListItemText
                            primary={member.name}
                            secondary={member.role}
                          />
                          {member.link && (
                            <IconButton
                              component="a"
                              href={member.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Visit ${member.name}'s profile`}
                              size="small"
                              sx={{ ml: "auto" }}
                            >
                              <LaunchIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
                <Card sx={{ ...cardStyle, borderColor: "primary.main" }}>
                  <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                      <GroupsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                      Contact
                    </Typography>
                    <List dense>
                      <ListItem>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                        >
                          <EmailIcon color="action" />
                          <Link href="mailto:tahayunusdemir@gmail.com">
                            tahayunusdemir@gmail.com
                          </Link>
                        </Stack>
                      </ListItem>
                      <ListItem>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                        >
                          <EmailIcon color="action" />
                          <Link href="mailto:nuno.pereira@ubi.pt">
                            nuno.pereira@ubi.pt
                          </Link>
                        </Stack>
                      </ListItem>
                      <ListItem>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                        >
                          <LocationOnIcon color="action" />
                          <Link
                            href="https://www.google.com/maps/place/Covilhã"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Covilhã, Portugal
                          </Link>
                        </Stack>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </PageLayout>
  );
}
