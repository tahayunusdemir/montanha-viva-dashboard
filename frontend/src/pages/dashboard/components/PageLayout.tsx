import * as React from "react";
import Box from "@mui/material/Box";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return <Box sx={{ width: "100%" }}>{children}</Box>;
}
