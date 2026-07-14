export type TeamStatus = "OPEN" | "RECRUITING" | "CLOSED" | "COMPLETED";

export type PostingTeam = {
  id: number;
  postingId: number;
  title: string;
  status: TeamStatus;
  recruitCount: number;
  applicantCount: number;
  categoryName: string;
};
