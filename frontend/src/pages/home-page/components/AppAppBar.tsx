import * as React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { styled, alpha } from "@mui/material/styles";
import { Link as ScrollLink } from "react-scroll";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Logo from "@/components/Logo";
import ThemeToggleButton from "@/components/ThemeToggleButton";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: "blur(24px)",
  border: "1px solid",
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
    : alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: "8px 12px",
}));

export default function AppAppBar() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: "transparent",
        backgroundImage: "none",
        mt: "calc(var(--template-frame-height, 0px) + 28px)",
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box
            sx={{ flexGrow: 1, display: "flex", alignItems: "center", px: 0 }}
          >
            <Box
              onClick={() => navigate("/")}
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
              <Logo />
            </Box>
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <Button
                variant="text"
                color="info"
                size="small"
                component={ScrollLink}
                to="features"
                spy
                smooth
                offset={-80}
              >
                Features
              </Button>
              <Button
                variant="text"
                color="info"
                size="small"
                component={ScrollLink}
                to="testimonials"
                spy
                smooth
                offset={-80}
              >
                Testimonials
              </Button>
              <Button
                variant="text"
                color="info"
                size="small"
                component={ScrollLink}
                to="highlights"
                spy
                smooth
                offset={-80}
              >
                Highlights
              </Button>
              <Button
                variant="text"
                color="info"
                size="small"
                sx={{ minWidth: 0 }}
                component={ScrollLink}
                to="faq"
                spy
                smooth
                offset={-80}
              >
                FAQ
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
              alignItems: "center",
            }}
          >
            <Button
              color="primary"
              variant="text"
              size="small"
              component={RouterLink}
              to="/sign-in"
            >
              Sign in
            </Button>
            <Button
              color="primary"
              variant="contained"
              size="small"
              component={RouterLink}
              to="/sign-up"
            >
              Sign up
            </Button>
            <ThemeToggleButton />
          </Box>
          <Box sx={{ display: { sm: "flex", md: "none" } }}>
            <IconButton
              aria-label="Menu"
              onClick={toggleDrawer(true)}
              sx={{ minWidth: "40px", height: "40px", p: "4px" }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  top: "var(--template-frame-height, 0px)",
                },
              }}
            >
              <Box sx={{ p: 2, backgroundColor: "background.default" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <ThemeToggleButton />
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
                <MenuItem
                  onClick={toggleDrawer(false)}
                  component={ScrollLink}
                  to="features"
                  spy
                  smooth
                  offset={-80}
                >
                  Features
                </MenuItem>
                <MenuItem
                  onClick={toggleDrawer(false)}
                  component={ScrollLink}
                  to="testimonials"
                  spy
                  smooth
                  offset={-80}
                >
                  Testimonials
                </MenuItem>
                <MenuItem
                  onClick={toggleDrawer(false)}
                  component={ScrollLink}
                  to="highlights"
                  spy
                  smooth
                  offset={-80}
                >
                  Highlights
                </MenuItem>
                <MenuItem
                  onClick={toggleDrawer(false)}
                  component={ScrollLink}
                  to="faq"
                  spy
                  smooth
                  offset={-80}
                >
                  FAQ
                </MenuItem>
                <Divider sx={{ my: 3 }} />
                <MenuItem>
                  <Button
                    color="primary"
                    variant="contained"
                    fullWidth
                    component={RouterLink}
                    to="/sign-up"
                  >
                    Sign up
                  </Button>
                </MenuItem>
                <MenuItem>
                  <Button
                    color="primary"
                    variant="outlined"
                    fullWidth
                    component={RouterLink}
                    to="/sign-in"
                  >
                    Sign in
                  </Button>
                </MenuItem>
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}
