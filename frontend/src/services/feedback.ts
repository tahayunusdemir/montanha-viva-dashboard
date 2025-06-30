import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import {
  Feedback,
  FeedbackUpdatePayload,
  FeedbackStatus,
  FeedbackSubmission,
} from "@/types/feedback";

interface FetchFeedbackParams {
  status?: FeedbackStatus | "";
  search?: string;
}

// Fetch all feedback with optional filters
const fetchFeedback = async (
  params: FetchFeedbackParams,
): Promise<Feedback[]> => {
  const { data } = await apiClient.get("/feedback/admin/", { params });
  return data;
};

export const useFeedback = (params: FetchFeedbackParams) => {
  return useQuery<Feedback[], Error>({
    queryKey: ["feedback", params],
    queryFn: () => fetchFeedback(params),
  });
};

// Fetch a single feedback entry by ID
const fetchFeedbackById = async (id: number): Promise<Feedback> => {
  const { data } = await apiClient.get(`/feedback/${id}/`);
  return data;
};

export const useFeedbackById = (id: number) => {
  return useQuery<Feedback, Error>({
    queryKey: ["feedback", id],
    queryFn: () => fetchFeedbackById(id),
    enabled: !!id,
  });
};

// Create a new feedback entry
const createFeedback = async (formData: FormData): Promise<Feedback> => {
  const { data } = await apiClient.post("/feedback/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const useCreateFeedback = () => {
  return useMutation<Feedback, Error, FormData>({
    mutationFn: createFeedback,
  });
};

// Update a feedback entry
const updateFeedback = async ({
  id,
  payload,
}: {
  id: number;
  payload: FeedbackUpdatePayload;
}): Promise<Feedback> => {
  const { data } = await apiClient.patch(`/feedback/admin/${id}/`, payload);
  return data;
};

export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
  });
};

// Delete a feedback entry
const deleteFeedback = async (id: number): Promise<void> => {
  await apiClient.delete(`/feedback/admin/${id}/`);
};

export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
  });
};
