import type { PostingCategory } from "@/features/category/types/postingCategory.types";

export type MockUser = {
  id: number;
  name: string;
  birthDate: string;
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
  email: string;
  password: string;
  nickname: string;
  introduction?: string | null;
  activityRegionId: number;
  interestCategories: PostingCategory[];
};

export const MOCK_USERS_STORAGE_KEY = "gather:msw:users";

const defaultMockUsers: MockUser[] = [
  {
    id: 1,
    name: "동진",
    birthDate: "2000-01-01",
    gender: "MALE",
    phoneNumber: "01012345678",
    email: "test@example.com",
    password: "test1234",
    nickname: "가더",
    introduction: "함께 봉사하는 걸 좋아해요.",
    activityRegionId: 201,
    interestCategories: ["ENVIRONMENT", "COMMUNITY"],
  },
];

function isMockUser(value: unknown): value is MockUser {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const user = value as Record<string, unknown>;

  return (
    typeof user.id === "number" &&
    Number.isInteger(user.id) &&
    typeof user.name === "string" &&
    typeof user.birthDate === "string" &&
    (user.gender === "MALE" || user.gender === "FEMALE") &&
    typeof user.phoneNumber === "string" &&
    typeof user.email === "string" &&
    typeof user.password === "string" &&
    typeof user.nickname === "string" &&
    (user.introduction === undefined ||
      user.introduction === null ||
      typeof user.introduction === "string") &&
    typeof user.activityRegionId === "number" &&
    Number.isInteger(user.activityRegionId) &&
    Array.isArray(user.interestCategories) &&
    user.interestCategories.every((category) => typeof category === "string")
  );
}

function hasMockUserConflict(user: MockUser, users: readonly MockUser[]) {
  return users.some(
    (existingUser) =>
      existingUser.id === user.id ||
      existingUser.email === user.email ||
      existingUser.phoneNumber === user.phoneNumber ||
      existingUser.nickname === user.nickname,
  );
}

function persistDynamicMockUsers(users: readonly MockUser[]) {
  if (typeof localStorage === "undefined") {
    return;
  }

  try {
    localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // localStorage를 사용할 수 없는 테스트·비브라우저 환경에서는 메모리 사용자만 사용한다.
  }
}

function loadPersistedMockUsers() {
  if (typeof localStorage === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(MOCK_USERS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsedUsers: unknown = JSON.parse(raw);

    if (!Array.isArray(parsedUsers) || !parsedUsers.every(isMockUser)) {
      throw new Error("Invalid persisted mock users.");
    }

    const persistedUsers = parsedUsers.filter(
      (user, index) =>
        !hasMockUserConflict(user, [
          ...defaultMockUsers,
          ...parsedUsers.slice(0, index),
        ]),
    );

    if (persistedUsers.length !== parsedUsers.length) {
      persistDynamicMockUsers(persistedUsers);
    }

    return persistedUsers;
  } catch {
    try {
      localStorage.removeItem(MOCK_USERS_STORAGE_KEY);
    } catch {
      // localStorage를 사용할 수 없는 테스트·비브라우저 환경에서는 제거하지 않는다.
    }

    return [];
  }
}

export const mockUsers: MockUser[] = [
  ...defaultMockUsers,
  ...loadPersistedMockUsers(),
];

export function getNextMockUserId() {
  return Math.max(0, ...mockUsers.map((user) => user.id)) + 1;
}

export function addMockUser(user: MockUser) {
  if (hasMockUserConflict(user, mockUsers)) {
    throw new Error("Mock user already exists.");
  }

  mockUsers.push(user);
  persistDynamicMockUsers(
    mockUsers.filter(
      (mockUser) =>
        !defaultMockUsers.some((defaultUser) => defaultUser.id === mockUser.id),
    ),
  );
}

export function getMockUserById(userId: number) {
  return mockUsers.find((user) => user.id === userId) ?? null;
}
