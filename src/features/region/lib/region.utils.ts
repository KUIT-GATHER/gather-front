import { REGION_LEVEL, type Region } from "../types/region.types";

export function getLevel2RegionsByGroup(
  regions: Region[],
  regionGroupId: number | null,
) {
  if (regionGroupId === null) {
    return [];
  }

  const level1RegionIds = new Set(
    regions
      .filter(
        (region) =>
          region.level === REGION_LEVEL.SIDO &&
          region.regionGroupId === regionGroupId,
      )
      .map((region) => region.id),
  );

  return regions
    .filter(
      (region) =>
        region.level === REGION_LEVEL.SIGUNGU &&
        region.parentId !== null &&
        level1RegionIds.has(region.parentId),
    )
    .sort((left, right) => left.id - right.id);
}

export function findRegionGroupIdBySelectedRegion(
  regions: Region[],
  selectedRegionId: number | null,
) {
  if (selectedRegionId === null) {
    return null;
  }

  const selectedRegion = regions.find(
    (region) => region.id === selectedRegionId,
  );

  if (!selectedRegion) {
    return null;
  }

  if (
    selectedRegion.level !== REGION_LEVEL.SIGUNGU ||
    selectedRegion.parentId === null
  ) {
    return null;
  }

  const level1Region = regions.find(
    (region) => region.id === selectedRegion.parentId,
  );

  return level1Region?.level === REGION_LEVEL.SIDO
    ? level1Region.regionGroupId
    : null;
}
