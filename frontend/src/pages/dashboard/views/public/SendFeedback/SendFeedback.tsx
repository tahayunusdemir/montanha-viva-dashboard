import * as React from "react";
import {
  Alert,
  Button,
  Card,
  FormControl,
  FormLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import PageLayout from "@/pages/dashboard/components/PageLayout";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const categories = [
  "General Feedback",
  "Bug Report",
  "Feature Request",
  "UI/UX Suggestion",
  "Other",
];

export default function SendFeedback() {
  const [category, setCategory] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size should not exceed 5MB.");
        setFile(null);
        setSuccess("");
        const fileInput = document.getElementById(
          "file-upload",
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
      } else {
        setError("");
        setFile(selectedFile);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    const fileInput = document.getElementById(
      "file-upload",
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Implement backend submission logic
    console.log({
      category,
      subject,
      message,
      fileName: file?.name,
      fileSize: file?.size,
    });
    // Reset form after submission
    setCategory("");
    setSubject("");
    setMessage("");
    setFile(null);
    setError("");
    setSuccess("Your feedback has been successfully submitted!");
    const fileInput = document.getElementById(
      "file-upload",
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
    window.scrollTo(0, 0);
  };

  return (
    <PageLayout>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Send Feedback
      </Typography>
      {success && (
        <Alert severity="success" sx={{ mb: 2, maxWidth: 600, mx: "auto" }}>
          {success}
        </Alert>
      )}
      <Card
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 600,
          mx: "auto",
        }}
      >
        <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
          <FormControl fullWidth required>
            <FormLabel htmlFor="category-select" sx={{ mb: 1 }}>
              Category
            </FormLabel>
            <Select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <FormLabel htmlFor="subject-input" sx={{ mb: 1 }}>
              Subject
            </FormLabel>
            <TextField
              id="subject-input"
              variant="outlined"
              fullWidth
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </FormControl>
          <FormControl fullWidth required>
            <FormLabel htmlFor="message-input" sx={{ mb: 1 }}>
              Message
            </FormLabel>
            <TextField
              id="message-input"
              multiline
              rows={4}
              variant="standard"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </FormControl>
          <Stack spacing={1.5}>
            <FormLabel>Attachment (Optional)</FormLabel>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                component="label"
                role={undefined}
                variant="outlined"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
              >
                Upload file
                <VisuallyHiddenInput
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                Max file size: 5MB.
              </Typography>
            </Stack>
            {file && (
              <Paper
                variant="outlined"
                sx={{
                  p: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {file.name}
                </Typography>
                <IconButton onClick={handleRemoveFile} size="small">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Paper>
            )}
            {error && (
              <Alert severity="error" onClose={() => setError("")}>
                {error}
              </Alert>
            )}
          </Stack>
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2, alignSelf: "flex-end" }}
          >
            Send Feedback
          </Button>
        </Stack>
      </Card>
    </PageLayout>
  );
}
