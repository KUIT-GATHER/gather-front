import { REGION_LEVEL, type Region } from "../types/region.types";

const LEVEL1_REGION_ORDER = [
  "서울특별시",
  "경기도",
  "인천광역시",
  "강원도",
  "충청남도",
  "충청북도",
  "대전광역시",
  "세종특별자치시",
];

export type RegionIndex = {
  byId: Map<number, Region>;
  childrenByParentId: Map<number, Region[]>;
  level1Regions: Region[];
};

export function createRegionIndex(regions: Region[]): RegionIndex {
  const byId = new Map<number, Region>();
  const childrenByParentId = new Map<number, Region[]>();
  const level1Regions: Region[] = [];

  regions.forEach((region) => {
    byId.set(region.id, region);

    if (region.level === REGION_LEVEL.SIDO) {
      level1Regions.push(region);
    }

    if (region.parentId !== null) {
      const children = childrenByParentId.get(region.parentId) ?? [];
      children.push(region);
      childrenByParentId.set(region.parentId, children);
    }
  });

  level1Regions.sort((left, right) => {
    const leftOrder = LEVEL1_REGION_ORDER.indexOf(left.name);
    const rightOrder = LEVEL1_REGION_ORDER.indexOf(right.name);
    const normalizedLeftOrder =
      leftOrder === -1 ? LEVEL1_REGION_ORDER.length : leftOrder;
    const normalizedRightOrder =
      rightOrder === -1 ? LEVEL1_REGION_ORDER.length : rightOrder;

    return (
      normalizedLeftOrder - normalizedRightOrder ||
      left.name.localeCompare(right.name, "ko")
    );
  });

  return { byId, childrenByParentId, level1Regions };
}
