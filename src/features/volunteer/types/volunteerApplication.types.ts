import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";

export type VolunteerPostingApplicationLink = {
  id: string;
  label: string;
  url: string;
};

export type VolunteerPostingApplicationDialogProps = {
  open: boolean;
  posting: VolunteerPosting;
  links: VolunteerPostingApplicationLink[];
  selectedLink: VolunteerPostingApplicationLink | null;
  onOpenChange: (open: boolean) => void;
  onSelectLink: (link: VolunteerPostingApplicationLink) => void;
  onCancel: () => void;
  onApply: () => void;
};
