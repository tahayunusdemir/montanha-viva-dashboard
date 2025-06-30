import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import AppTheme from "@/theme/AppTheme";
import AppAppBar from "@/pages/home-page/components/AppAppBar";
import Hero from "@/pages/home-page/components/Hero";
import LogoCollection from "@/pages/home-page/components/LogoCollection";
import Highlights from "@/pages/home-page/components/Highlights";
import Features from "@/pages/home-page/components/Features";
import Testimonials from "@/pages/home-page/components/Testimonials";
import FAQ from "@/pages/home-page/components/FAQ";
import Footer from "@/pages/home-page/components/Footer";

export default function HomePage(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />

      <AppAppBar />
      <Hero />
      <div>
        <Features />
        <Divider />
        <Testimonials />
        <Divider />
        <Highlights />
        <Divider />
        <FAQ />
        <Divider />
        <LogoCollection />
        <Divider />
        <Footer />
      </div>
    </AppTheme>
  );
}
