import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import Logo from "@/components/Logo";
import partnersLogos from "@/assets/partners-logos.png";
import { Link as ScrollLink } from "react-scroll";

function Copyright() {
  return (
    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
      {"Copyright © "}
      <MuiLink color="text.secondary" href="https://mui.com/">
        Montanha Viva
      </MuiLink>
      &nbsp;
      {new Date().getFullYear()}
    </Typography>
  );
}

export default function Footer() {
  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 4, sm: 8 },
        py: { xs: 8, sm: 10 },
        textAlign: { sm: "center", md: "left" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            minWidth: { xs: "100%", sm: "60%" },
            mb: { xs: 4, sm: 0 },
          }}
        >
          <Logo />
          <Box
            component="img"
            src={partnersLogos}
            alt="Partner logos"
            sx={{
              height: { xs: 80, sm: 120, md: 180 },
              ml: { xs: 2, sm: 4, md: 6 },
              opacity: 0.8,
              verticalAlign: "middle",
              maxWidth: "100%",
              width: "auto",
            }}
          />
        </Box>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
            Product
          </Typography>
          <MuiLink
            component={ScrollLink}
            to="features"
            spy
            smooth
            offset={-80}
            color="text.secondary"
            variant="body2"
            sx={{ cursor: "pointer" }}
          >
            Features
          </MuiLink>
          <MuiLink
            component={ScrollLink}
            to="testimonials"
            spy
            smooth
            offset={-80}
            color="text.secondary"
            variant="body2"
            sx={{ cursor: "pointer" }}
          >
            Testimonials
          </MuiLink>
          <MuiLink
            component={ScrollLink}
            to="highlights"
            spy
            smooth
            offset={-80}
            color="text.secondary"
            variant="body2"
            sx={{ cursor: "pointer" }}
          >
            Highlights
          </MuiLink>
          <MuiLink
            component={ScrollLink}
            to="faq"
            spy
            smooth
            offset={-80}
            color="text.secondary"
            variant="body2"
            sx={{ cursor: "pointer" }}
          >
            FAQ
          </MuiLink>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          pt: { xs: 4, sm: 8 },
          width: "100%",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <div>
          <MuiLink color="text.secondary" variant="body2" href="#">
            Privacy Policy
          </MuiLink>
          <Typography sx={{ display: "inline", mx: 0.5, opacity: 0.5 }}>
            &nbsp;•&nbsp;
          </Typography>
          <MuiLink color="text.secondary" variant="body2" href="#">
            Terms of Service
          </MuiLink>
          <Copyright />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              mt: 1,
              maxWidth: "500px",
            }}
          >
            Montanha Viva was funded by the Promove 2022 Program - a competition
            promoted by the &quot;la Caixa&quot; Foundation and the Foundation
            for Science and Technology, to boost the border regions of
            Portugal&apos;s interior.
          </Typography>
        </div>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ justifyContent: "left", color: "text.secondary" }}
        >
          <IconButton
            color="inherit"
            size="small"
            href="https://www.linkedin.com/company/montanha-viva/"
            aria-label="LinkedIn"
            sx={{ alignSelf: "center" }}
          >
            <LinkedInIcon />
          </IconButton>
        </Stack>
      </Box>
    </Container>
  );
}
