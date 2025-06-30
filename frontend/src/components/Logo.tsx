import * as React from "react";
import { useColorScheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import logo from "@/assets/logo.gif";
import { type SxProps, type Theme } from "@mui/material/styles";

/**
 * Logo component
 * - Displays the logo at its natural aspect ratio (600x338)
 * - Scales responsively while maintaining clarity and proportion
 */
export default function Logo({ sx: sxProp }: { sx?: SxProps<Theme> }) {
  const { mode } = useColorScheme();
  return (
    <Box
      component="img"
      src={logo}
      alt="logo"
      sx={{
        width: { xs: 100, sm: 110, md: 120, lg: 130 }, // Responsive width
        height: "auto", // Maintain aspect ratio (600x338)
        maxWidth: 600,
        maxHeight: 338,
        display: "block",
        mr: 2,
        ...(mode === "dark" && {
          filter: "invert(1)",
        }),
        ...sxProp,
      }}
    />
  );
}
