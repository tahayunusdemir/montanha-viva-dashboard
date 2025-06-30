export type FeedbackStatus = "pending" | "in_progress" | "resolved" | "closed";

interface UserDetails {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Feedback {
  id: number;
  user: number | null;
  user_details: UserDetails | null;
  name: string;
  surname: string;
  email: string;
  subject: string;
  message: string;
  status: FeedbackStatus;
  document: string | null;
  created_at: string;
}

export interface FeedbackSubmission {
  name: string;
  surname: string;
  email: string;
  subject: string;
  message: string;
  document?: File;
}

export interface FeedbackUpdatePayload {
  status: FeedbackStatus;
}
