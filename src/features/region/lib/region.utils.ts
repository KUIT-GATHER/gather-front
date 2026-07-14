import type { Region } from "../types/region.types";

export function getLevel1Regions(regions: Region[]) {
  return regions.filter(
    (region) => region.level === 1 && region.parentId === null,
  );
}

export function getChildRegions(
  regions: Region[],
  parentRegionId: number | null,
) {
  if (parentRegionId === null) {
    return [];
  }

  return regions.filter(
    (region) => region.level === 2 && region.parentId === parentRegionId,
  );
}

export function findLevel1RegionId(
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

  return selectedRegion.level === 1
    ? selectedRegion.id
    : selectedRegion.parentId;
}
