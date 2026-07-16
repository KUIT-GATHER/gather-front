export const REGION_LEVEL = {
  SIDO: 1,
  SIGUNGU: 2,
  EUP_MYEON_DONG: 4,
} as const;

export type RegionLevel = (typeof REGION_LEVEL)[keyof typeof REGION_LEVEL];

export type Region = {
  id: number;
  name: string;
  level: RegionLevel;
  code: string;
  parentId: number | null;
  regionGroupId: number | null;
};

export type RegionGroup = {
  id: number;
  code: string;
  name: string;
};
