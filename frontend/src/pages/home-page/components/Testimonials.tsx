import * as React from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { useColorScheme } from "@mui/material/styles";

const userTestimonials = [
  {
    avatar: <Avatar alt="Sofia Almeida" src="/static/images/avatar/1.jpg" />,
    name: "Sofia Almeida",
    occupation: "Local Farmer",
    testimonial:
      "Montanha Viva's dashboard has transformed how I manage my crops. The real-time soil and weather data helps me make informed decisions, improving sustainability and yield. It's technology that truly respects the land.",
  },
  {
    avatar: <Avatar alt="David Wilson" src="/static/images/avatar/2.jpg" />,
    name: "David Wilson",
    occupation: "Tourist & Hiker",
    testimonial:
      "The interactive trails are fantastic! Scanning the QR codes to learn about the plants made our family hike so much more engaging. It felt like we had a personal botanist with us.",
  },
  {
    avatar: <Avatar alt="Dr. Elena Ricci" src="/static/images/avatar/3.jpg" />,
    name: "Dr. Elena Ricci",
    occupation: "University Researcher",
    testimonial:
      "As a biology researcher, this platform is an invaluable resource. The detailed flora database and environmental monitoring data are perfect for my research on local ecosystems and the impacts of climate change.",
  },
  {
    avatar: <Avatar alt="Marco Vieira" src="/static/images/avatar/4.jpg" />,
    name: "Marco Vieira",
    occupation: "Guesthouse Owner",
    testimonial:
      "I recommend the Montanha Viva app to all my guests. It enriches their stay by connecting them with the nature of Serra da Gardunha. It's a fantastic tool for promoting sustainable tourism in our region.",
  },
  {
    avatar: <Avatar alt="Isabella Chen" src="/static/images/avatar/5.jpg" />,
    name: "Isabella Chen",
    occupation: "Student",
    testimonial:
      "Using the platform for my university project was a game-changer. The data is accessible, and the biodiversity explorer is so easy to use. I learned more about local plants in a week than I did in a semester.",
  },
  {
    avatar: <Avatar alt="Paulo Costa" src="/static/images/avatar/6.jpg" />,
    name: "Paulo Costa",
    occupation: "Local Guide",
    testimonial:
      "The quality of information is outstanding. I now use the app to add more depth to my guided tours, sharing details about the medicinal and traditional uses of plants we find along the way. My clients love it.",
  },
];

export default function Testimonials() {
  useColorScheme();

  return (
    <Container
      id="testimonials"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 3, sm: 6 },
        scrollMarginTop: "80px",
      }}
    >
      <Box
        sx={{
          width: { sm: "100%", md: "60%" },
          textAlign: { sm: "left", md: "center" },
        }}
      >
        <Typography
          component="h2"
          variant="h4"
          gutterBottom
          sx={{ color: "text.primary" }}
        >
          Voices from the Mountain
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          See how Montanha Viva is making a difference. From farmers and
          researchers to hikers and local guides, discover how our platform is
          fostering a deeper connection with the natural world.
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {userTestimonials.map((testimonial, index) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 4 }}
            key={index}
            sx={{ display: "flex" }}
          >
            <Card
              variant="outlined"
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flexGrow: 1,
              }}
            >
              <CardContent>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ color: "text.secondary" }}
                >
                  {testimonial.testimonial}
                </Typography>
              </CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                }}
              >
                <CardHeader
                  avatar={testimonial.avatar}
                  title={testimonial.name}
                  subheader={testimonial.occupation}
                />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
