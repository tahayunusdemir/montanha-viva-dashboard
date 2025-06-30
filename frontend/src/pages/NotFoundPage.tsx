import { Link } from "react-router-dom";
import { Box, Button, Container, Typography } from "@mui/material";

const NotFoundPage = () => {
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          py: 8,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Typography variant="h1" component="h1" fontWeight="bold">
          404
        </Typography>
        <Typography variant="h5" component="h2">
          Page Not Found
        </Typography>
        <Typography color="text.secondary">
          Sorry, we couldn't find the page you're looking for.
        </Typography>
        <Button component={Link} to="/" variant="contained">
          Go back home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
