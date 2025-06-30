import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import sponsorsLogos from "@/assets/sponsors-logos.png";

const logoStyle = {
  width: "100%",
  maxWidth: "800px",
  height: "auto",
  margin: "auto",
  opacity: 0.8,
};

export default function LogoCollection() {
  return (
    <Box id="logoCollection" sx={{ py: 4 }}>
      <Typography
        component="p"
        variant="h5"
        align="center"
        sx={{ color: "text.primary", mb: 4 }}
      >
        Our Sponsors
      </Typography>
      <Grid container sx={{ justifyContent: "center", mt: 0.5 }}>
        <img src={sponsorsLogos} alt="Sponsors" style={logoStyle} />
      </Grid>
    </Box>
  );
}
