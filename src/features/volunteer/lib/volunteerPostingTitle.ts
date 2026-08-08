const VOLUNTEER_POSTING_HEADER_TITLE_MAX_LENGTH = 15;

export function formatVolunteerPostingHeaderTitle(title: string) {
  if (title.length <= VOLUNTEER_POSTING_HEADER_TITLE_MAX_LENGTH) {
    return title;
  }

  return `${title.slice(0, VOLUNTEER_POSTING_HEADER_TITLE_MAX_LENGTH)}...`;
}
