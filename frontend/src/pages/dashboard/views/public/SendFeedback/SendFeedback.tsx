import React, { useState, useEffect } from "react";
import {
  Alert,
  Button,
  Card,
  FormControl,
  FormLabel,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import PageLayout from "@/pages/dashboard/components/PageLayout";
import { useCreateFeedback } from "@/services/feedback";

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

export default function SendFeedback() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");

  const createFeedbackMutation = useCreateFeedback();

  useEffect(() => {
    if (createFeedbackMutation.isSuccess) {
      // Reset form after successful submission
      setSubject("");
      setMessage("");
      setFile(null);
      setCategory("general");
      setFormError("");
      const fileInput = document.getElementById(
        "file-upload",
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
      window.scrollTo(0, 0);
    }
  }, [createFeedbackMutation.isSuccess]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setFormError("File size should not exceed 5MB.");
        setFile(null);
        const fileInput = document.getElementById(
          "file-upload",
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
      } else {
        setFormError("");
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

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("message", message);
    formData.append("category", category);

    if (file) {
      formData.append("document", file);
    }

    createFeedbackMutation.mutate(formData);
  };

  return (
    <PageLayout>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Send Feedback
      </Typography>
      {createFeedbackMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 2, maxWidth: 600, mx: "auto" }}>
          Your feedback has been successfully submitted!
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
          <FormControl fullWidth>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={category}
              label="Category"
              onChange={(e: SelectChangeEvent) => setCategory(e.target.value)}
            >
              <MenuItem value="general">General Inquiry</MenuItem>
              <MenuItem value="bug">Bug Report</MenuItem>
              <MenuItem value="feature">Feature Request</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <FormLabel htmlFor="subject-input" sx={{ mb: 1 }}>
              Subject
            </FormLabel>
            <TextField
              id="subject-input"
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
              variant="outlined"
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
                disabled={createFeedbackMutation.isPending}
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
                <IconButton
                  onClick={handleRemoveFile}
                  size="small"
                  disabled={createFeedbackMutation.isPending}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Paper>
            )}
            {formError && (
              <Alert severity="error" onClose={() => setFormError("")}>
                {formError}
              </Alert>
            )}
            {createFeedbackMutation.isError && (
              <Alert severity="error">
                {createFeedbackMutation.error.message ||
                  "An unexpected error occurred."}
              </Alert>
            )}
          </Stack>
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2, alignSelf: "flex-end" }}
            disabled={createFeedbackMutation.isPending}
          >
            {createFeedbackMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              "Send Feedback"
            )}
          </Button>
        </Stack>
      </Card>
    </PageLayout>
  );
}
