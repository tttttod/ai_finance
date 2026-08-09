export interface UserFeedbackPayload {
  rating: number;
  selectedIssues?: string[];
  dimensionScores?: Record<string, number>;
  comment: string;
  page: string;
  createdAt: string;
  userAgent?: string;
}
