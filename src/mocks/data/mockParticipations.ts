export type MockParticipation = {
  participationId: number;
  userId: number;
  postingId: number;
  status: "APPLIED";
};

const participations: MockParticipation[] = [];
let nextParticipationId = 1;

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
  const participation: MockParticipation = {
    participationId: nextParticipationId++,
    userId,
    postingId,
    status: "APPLIED",
  };

  participations.push(participation);
  return participation;
}

export function removeMockParticipation(userId: number, postingId: number) {
  const index = participations.findIndex(
    (participation) =>
      participation.userId === userId && participation.postingId === postingId,
  );

  if (index === -1) return false;

  participations.splice(index, 1);
  return true;
}
