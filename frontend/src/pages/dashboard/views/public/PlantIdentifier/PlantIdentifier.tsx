import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PageLayout from "@/pages/dashboard/components/PageLayout";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import floraService from "@/services/flora";
import { Plant } from "@/types";
import FloraDetailModal from "../FloraEncyclopedia/components/FloraDetailModal";

const DropzoneContainer = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  transition: "border-color 0.3s",
  "&:hover": {
    borderColor: theme.palette.primary.main,
  },
}));

interface Prediction {
  class: string;
  confidence: number;
}

export default function PlantIdentifier() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<Prediction[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: allPlants } = useQuery({
    queryKey: ["plants"],
    queryFn: floraService.getPlants,
    refetchOnWindowFocus: false,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
      setResults([]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleIdentifyClick = () => {
    if (file) {
      setIsLoading(true);
      setError(null);
      setResults([]);

      setTimeout(() => {
        // Simulate a successful API call with mock data using plants from the database
        const mockData: Prediction[] = [
          { class: "Arbutus unedo", confidence: 0.92 },
          { class: "Lavandula pedunculata", confidence: 0.75 },
          { class: "Calluna vulgaris", confidence: 0.51 },
        ];
        setResults(mockData);
        setIsLoading(false);
      }, 2000);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
    setResults([]);
    setError(null);
    setIsLoading(false);
  };

  const handleOpenModal = (plant: Plant) => {
    setSelectedPlant(plant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlant(null);
  };

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom>
        Plant Identifier
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Upload an image of a plant, and our AI will try to identify it for you.
      </Typography>

      <Card>
        <CardContent>
          {!preview && (
            <DropzoneContainer {...getRootProps()}>
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary" }} />
              <Typography>
                {isDragActive
                  ? "Drop the image here..."
                  : "Drag and drop an image here, or click to select one"}
              </Typography>
            </DropzoneContainer>
          )}

          {preview && (
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <img
                src={preview}
                alt="Preview"
                style={{ maxHeight: "300px", maxWidth: "100%", borderRadius: "8px" }}
              />
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleIdentifyClick}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Identify Plant"
                  )}
                </Button>
                <Button
                  onClick={handleRemoveImage}
                  sx={{ ml: 1 }}
                  color="secondary"
                >
                  Remove Image
                </Button>
              </Box>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Error: {error.message}
            </Alert>
          )}

          {results.length > 0 && !isLoading && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">Identification Results:</Typography>
              <Paper variant="outlined" sx={{ mt: 1 }}>
                <List>
                  {results.map((prediction, index) => {
                    const plant = allPlants?.find(
                      (p) => p.scientific_name === prediction.class
                    );
                    return (
                      <ListItemButton
                        key={index}
                        divider
                        disabled={!plant}
                        onClick={() => plant && handleOpenModal(plant)}
                      >
                        <ListItemText
                          primary={prediction.class}
                          secondary={`Confidence: ${(
                            prediction.confidence * 100
                          ).toFixed(2)}%`}
                        />
                        <Chip
                          label={
                            prediction.confidence > 0.7
                              ? "High Confidence"
                              : "Low Confidence"
                          }
                          color={
                            prediction.confidence > 0.7 ? "success" : "warning"
                          }
                          size="small"
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Paper>
            </Box>
          )}
        </CardContent>
      </Card>
      <FloraDetailModal
        open={isModalOpen}
        onClose={handleCloseModal}
        plant={selectedPlant}
      />
    </PageLayout>
  );
}
