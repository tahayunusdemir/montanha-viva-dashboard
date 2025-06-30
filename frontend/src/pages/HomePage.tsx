import { Link } from "react-router-dom";
import { Container, Box, Typography, Button, Stack } from "@mui/material";

const HomePage = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Typography component="h1" variant="h4">
          Welcome to Montanha Viva
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button component={Link} to="/sign-in" variant="contained">
            Sign In
          </Button>
          <Button component={Link} to="/sign-up" variant="outlined">
            Sign Up
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default HomePage;
