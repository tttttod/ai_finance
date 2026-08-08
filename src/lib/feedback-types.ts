export interface UserFeedbackPayload {
  rating: number;
  selectedIssues: string[];
  comment: string;
  page: string;
  createdAt: string;
  userAgent?: string;
}
