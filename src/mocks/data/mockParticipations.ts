export type MockParticipation = {
  participationId: number;
  userId: number;
  postingId: number;
  status: "APPLIED" | "CONFIRMED" | "COMPLETED" | "REVIEWED";
  recognizedMinutes?: number;
};

const STORAGE_KEY = "gather_mock_posting_participations";
const defaultParticipations: MockParticipation[] = [
  { participationId: 201, userId: 1, postingId: 1, status: "APPLIED" },
  { participationId: 202, userId: 1, postingId: 2, status: "CONFIRMED" },
  { participationId: 203, userId: 1, postingId: 3, status: "COMPLETED" },
  { participationId: 204, userId: 1, postingId: 4, status: "REVIEWED" },
];

function readParticipations() {
  if (typeof localStorage === "undefined") return [...defaultParticipations];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored
      ? (JSON.parse(stored) as MockParticipation[])
      : [...defaultParticipations];
  } catch {
    return [...defaultParticipations];
  }
}

const participations = readParticipations();
let nextParticipationId =
  Math.max(0, ...participations.map(({ participationId }) => participationId)) +
  1;

function persistParticipations() {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(participations));
  }
}

export function findMockParticipation(userId: number, postingId: number) {
  return participations.find(
    (participation) =>
      participation.userId === userId && participation.postingId === postingId,
  );
}

export function getMockParticipations(userId: number) {
  return participations.filter(
    (participation) => participation.userId === userId,
  );
}

export function addMockParticipation(userId: number, postingId: number) {
  const existing = findMockParticipation(userId, postingId);
  if (existing) return existing;

  const participation: MockParticipation = {
    participationId: nextParticipationId++,
    userId,
    postingId,
    status: "APPLIED",
  };

  participations.push(participation);
  persistParticipations();
  return participation;
}

export function updateMockParticipation(
  userId: number,
  postingId: number,
  update: Partial<Pick<MockParticipation, "status" | "recognizedMinutes">>,
) {
  const participation = findMockParticipation(userId, postingId);
  if (!participation) return;

  Object.assign(participation, update);
  persistParticipations();
}

export function removeMockParticipation(userId: number, postingId: number) {
  const index = participations.findIndex(
    (participation) =>
      participation.userId === userId && participation.postingId === postingId,
  );

  if (index === -1) return false;

  participations.splice(index, 1);
  persistParticipations();
  return true;
}
