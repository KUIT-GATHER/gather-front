import { useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
import { toast } from "sonner";

import { createRegionIndex } from "@/features/region/lib/createRegionIndex";
import { getFullRegionSelectionLabel } from "@/features/region/lib/regionLabel";
import {
  REGION_LEVEL,
  type Region,
} from "@/features/region/types/region.types";
import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import { useVolunteerPostingMapQuery } from "@/features/volunteer/hooks/useVolunteerPostingMapQuery";
import {
  type KakaoLatLng,
  type KakaoMap,
  type KakaoAddressSearchResult,
  type KakaoKeywordSearchResult,
  type KakaoMaps,
  loadKakaoMapSdk,
} from "@/features/volunteer/lib/kakaoMapSdk";
import {
  type VolunteerPostingMapMarkerItem,
  useVolunteerPostingMapMarkers,
} from "@/features/volunteer/hooks/useVolunteerPostingMapMarkers";
import {
  getRepresentativeVolunteerPostingLocation,
  isSameVolunteerPostingMapBounds,
  normalizeVolunteerPostingMapBounds,
} from "@/features/volunteer/lib/volunteerPostingMap";
import type { VolunteerPostingFilter } from "@/features/volunteer/types/volunteerPostingFilter.types";
import type { VolunteerPostingMapBounds } from "@/features/volunteer/types/volunteer.types";
import { cn } from "@/shared/lib/cn";
import BottomSheet from "@/shared/ui/BottomSheet";
import Button from "@/shared/ui/Button";
import { ErrorState } from "@/shared/ui/ErrorState";
import IconButton from "@/shared/ui/IconButton";
import LoadingState from "@/shared/ui/LoadingState";

import { VolunteerPostingMapCard } from "./VolunteerPostingMapCard";

const DEFAULT_MAP_CENTER = {
  latitude: 37.5665,
  longitude: 126.978,
};
const DEFAULT_MAP_LEVEL = 8;

type SdkState = "loading" | "ready" | "error";

type VolunteerPostingMapSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: VolunteerPostingFilter;
  onSelectPosting: (postingId: number) => void;
};

function getMapBounds(map: KakaoMap): VolunteerPostingMapBounds {
  const bounds = map.getBounds();
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();

  return normalizeVolunteerPostingMapBounds({
    swLat: southWest.getLat(),
    swLng: southWest.getLng(),
    neLat: northEast.getLat(),
    neLng: northEast.getLng(),
  });
}

function getInitialMapLevel(region: Region | undefined) {
  return region?.level === REGION_LEVEL.SIGUNGU ? 6 : 9;
}

function getRegionGeocodeLabel(
  region: Region | undefined,
  parentRegion: Region | undefined,
) {
  if (!region) {
    return undefined;
  }

  return getFullRegionSelectionLabel(region, parentRegion);
}

function getRegionKeywordFallback(
  region: Region | undefined,
  parentRegion: Region | undefined,
) {
  const label = getRegionGeocodeLabel(region, parentRegion);

  return label ? `${label}청` : undefined;
}

function getFirstSearchResultPosition(
  maps: KakaoMaps,
  results: ReadonlyArray<KakaoAddressSearchResult | KakaoKeywordSearchResult>,
) {
  const firstResult = results.find((result) => {
    const latitude = Number(result.y);
    const longitude = Number(result.x);

    return Number.isFinite(latitude) && Number.isFinite(longitude);
  });

  if (!firstResult) {
    return undefined;
  }

  return new maps.LatLng(Number(firstResult.y), Number(firstResult.x));
}

function geocodeRegion(
  maps: KakaoMaps,
  region: Region | undefined,
  parentRegion: Region | undefined,
): Promise<KakaoLatLng | undefined> {
  const addressQuery = getRegionGeocodeLabel(region, parentRegion);
  const keywordQuery = getRegionKeywordFallback(region, parentRegion);

  if (!addressQuery) {
    return Promise.resolve(undefined);
  }

  const geocoder = new maps.services.Geocoder();

  return new Promise((resolve) => {
    geocoder.addressSearch(addressQuery, (results, status) => {
      const addressPosition =
        status === maps.services.Status.OK
          ? getFirstSearchResultPosition(maps, results)
          : undefined;

      if (addressPosition) {
        resolve(addressPosition);
        return;
      }

      if (!keywordQuery) {
        resolve(undefined);
        return;
      }

      const places = new maps.services.Places();

      places.keywordSearch(keywordQuery, (keywordResults, keywordStatus) => {
        resolve(
          keywordStatus === maps.services.Status.OK
            ? getFirstSearchResultPosition(maps, keywordResults)
            : undefined,
        );
      });
    });
  });
}

export function VolunteerPostingMapSheet({
  open,
  onOpenChange,
  filter,
  onSelectPosting,
}: VolunteerPostingMapSheetProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | undefined>(undefined);
  const mapsRef = useRef<KakaoMaps | undefined>(undefined);
  const [mapsInstance, setMapsInstance] = useState<KakaoMaps>();
  const [mapInstance, setMapInstance] = useState<KakaoMap>();
  const [sdkState, setSdkState] = useState<SdkState>("loading");
  const [sdkAttempt, setSdkAttempt] = useState(0);
  const [regionLocationAttempt, setRegionLocationAttempt] = useState(0);
  const [isRegionLocationError, setIsRegionLocationError] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [pendingBounds, setPendingBounds] =
    useState<VolunteerPostingMapBounds>();
  const [searchedBounds, setSearchedBounds] =
    useState<VolunteerPostingMapBounds>();
  const [displayedBounds, setDisplayedBounds] =
    useState<VolunteerPostingMapBounds>();
  const [selectedPostingId, setSelectedPostingId] = useState<number | null>(
    null,
  );
  const regionsQuery = useRegionsQuery(filter.regionId !== undefined);
  const regionIndex = useMemo(
    () => createRegionIndex(regionsQuery.data ?? []),
    [regionsQuery.data],
  );
  const selectedRegion =
    filter.regionId === undefined
      ? undefined
      : regionIndex.byId.get(filter.regionId);
  const selectedRegionParent = selectedRegion?.parentId
    ? regionIndex.byId.get(selectedRegion.parentId)
    : undefined;
  const hasSelectedRegionFilter = filter.regionId !== undefined;
  const isSelectedRegionMissing =
    hasSelectedRegionFilter && regionsQuery.isSuccess && !selectedRegion;
  const hasRegionQueryError = hasSelectedRegionFilter && regionsQuery.isError;
  const hasRegionLocationError =
    hasRegionQueryError || isSelectedRegionMissing || isRegionLocationError;
  const shouldWaitForRegion =
    hasSelectedRegionFilter && !regionsQuery.isSuccess && !regionsQuery.isError;

  useEffect(() => {
    let active = true;

    void loadKakaoMapSdk()
      .then((maps) => {
        if (!active) return;
        mapsRef.current = maps;
        setMapsInstance(maps);
        setSdkState("ready");
      })
      .catch(() => {
        if (!active) return;
        setSdkState("error");
      });

    return () => {
      active = false;
    };
  }, [sdkAttempt]);

  useEffect(() => {
    const maps = mapsRef.current;
    const container = mapContainerRef.current;

    if (
      sdkState !== "ready" ||
      !maps ||
      !container ||
      shouldWaitForRegion ||
      hasRegionLocationError ||
      mapRef.current
    ) {
      return;
    }

    let disposed = false;
    let frameId: number | undefined;
    let map: KakaoMap | undefined;
    let handleIdle: (() => void) | undefined;
    let handleDragStart: (() => void) | undefined;
    let handleZoomStart: (() => void) | undefined;
    const initializeMap = async () => {
      const initialCenter = hasSelectedRegionFilter
        ? await geocodeRegion(maps, selectedRegion, selectedRegionParent)
        : new maps.LatLng(
            DEFAULT_MAP_CENTER.latitude,
            DEFAULT_MAP_CENTER.longitude,
          );

      if (disposed) return;

      if (!initialCenter) {
        setIsRegionLocationError(true);
        return;
      }

      const initialMap = new maps.Map(container, {
        center: initialCenter,
        level: hasSelectedRegionFilter
          ? getInitialMapLevel(selectedRegion)
          : DEFAULT_MAP_LEVEL,
      });
      map = initialMap;
      handleIdle = () => {
        if (!disposed) {
          setPendingBounds(getMapBounds(initialMap));
        }
      };
      handleDragStart = () => {
        if (!disposed) {
          setSelectedPostingId(null);
        }
      };
      handleZoomStart = () => {
        if (!disposed) {
          setSelectedPostingId(null);
        }
      };

      mapRef.current = initialMap;
      setMapInstance(initialMap);
      frameId = window.requestAnimationFrame(() => {
        if (disposed || !handleIdle || !handleDragStart || !handleZoomStart) {
          return;
        }

        initialMap.relayout();
        const initialBounds = getMapBounds(initialMap);
        setPendingBounds(initialBounds);
        setSearchedBounds(initialBounds);
        setDisplayedBounds(initialBounds);
        maps.event.addListener(initialMap, "idle", handleIdle);
        maps.event.addListener(initialMap, "dragstart", handleDragStart);
        maps.event.addListener(initialMap, "zoom_start", handleZoomStart);
        setIsMapReady(true);
      });
    };

    void initializeMap();

    return () => {
      disposed = true;
      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId);
      }
      if (map && handleIdle) {
        maps.event.removeListener(map, "idle", handleIdle);
      }
      if (map && handleDragStart) {
        maps.event.removeListener(map, "dragstart", handleDragStart);
      }
      if (map && handleZoomStart) {
        maps.event.removeListener(map, "zoom_start", handleZoomStart);
      }
      if (map && mapRef.current === map) {
        mapRef.current = undefined;
        setMapInstance(undefined);
      }
    };
  }, [
    hasRegionLocationError,
    hasSelectedRegionFilter,
    regionLocationAttempt,
    sdkState,
    selectedRegion,
    selectedRegionParent,
    shouldWaitForRegion,
  ]);

  const mapParams = useMemo(
    () =>
      searchedBounds
        ? {
            ...searchedBounds,
            ...(filter.regionId !== undefined
              ? { regionId: filter.regionId }
              : {}),
            ...(filter.activityStartDate && filter.activityEndDate
              ? {
                  activityStartDate: filter.activityStartDate,
                  activityEndDate: filter.activityEndDate,
                }
              : {}),
            ...(filter.category ? { category: filter.category } : {}),
          }
        : undefined,
    [filter, searchedBounds],
  );
  const mapQuery = useVolunteerPostingMapQuery(mapParams);

  useEffect(() => {
    if (!searchedBounds || !mapQuery.data || mapQuery.isPlaceholderData) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDisplayedBounds((current) =>
        current && isSameVolunteerPostingMapBounds(current, searchedBounds)
          ? current
          : searchedBounds,
      );
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [mapQuery.data, mapQuery.isPlaceholderData, searchedBounds]);

  const markerItems = useMemo<VolunteerPostingMapMarkerItem[]>(() => {
    if (!mapQuery.data || !displayedBounds) {
      return [];
    }

    return mapQuery.data.flatMap((posting) => {
      const location = getRepresentativeVolunteerPostingLocation(
        posting,
        displayedBounds,
      );

      if (
        !location ||
        location.latitude === null ||
        location.longitude === null
      ) {
        return [];
      }

      return [
        {
          posting,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      ];
    });
  }, [displayedBounds, mapQuery.data]);

  useVolunteerPostingMapMarkers({
    maps: mapsInstance,
    map: mapInstance,
    isMapReady,
    markerItems,
    selectedPostingId,
    onSelectPosting: setSelectedPostingId,
  });

  useEffect(() => {
    if (
      selectedPostingId !== null &&
      !markerItems.some((item) => item.posting.id === selectedPostingId)
    ) {
      const timeoutId = window.setTimeout(() => setSelectedPostingId(null), 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [markerItems, selectedPostingId]);

  const selectedPosting = markerItems.find(
    (item) => item.posting.id === selectedPostingId,
  )?.posting;

  const handleSearchThisArea = () => {
    if (!pendingBounds || mapQuery.isFetching) {
      return;
    }

    if (
      searchedBounds &&
      isSameVolunteerPostingMapBounds(pendingBounds, searchedBounds)
    ) {
      void mapQuery.refetch();
      return;
    }

    setSearchedBounds(pendingBounds);
  };

  const handleCurrentLocation = () => {
    const maps = mapsRef.current;
    const map = mapRef.current;

    if (!maps || !map || !navigator.geolocation) {
      toast("현재 위치를 불러오지 못했어요.", { id: "map-location-toast" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedPostingId(null);
        map.panTo(
          new maps.LatLng(position.coords.latitude, position.coords.longitude),
        );
      },
      () => {
        toast("현재 위치를 불러오지 못했어요.", {
          id: "map-location-toast",
        });
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  };

  const isWaitingForMap =
    sdkState === "ready" && !isMapReady && !hasRegionLocationError;
  const controlsBottomClassName = selectedPosting
    ? "bottom-[calc(env(safe-area-inset-bottom)+12rem)]"
    : "bottom-[calc(env(safe-area-inset-bottom)+1rem)]";

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="지도"
      className="h-[min(88dvh,46rem)] max-h-[min(88dvh,46rem)] rounded-t-[40px] bg-bg"
      contentClassName="overflow-hidden p-0"
    >
      <div className="relative h-full min-h-[24rem] bg-bg">
        {sdkState === "ready" ? (
          <div ref={mapContainerRef} className="size-full" />
        ) : null}

        {sdkState === "loading" || isWaitingForMap ? (
          <LoadingState
            label="지도를 불러오는 중이에요."
            className="absolute inset-0 bg-bg"
          />
        ) : null}

        {sdkState === "error" ? (
          <ErrorState
            title="지도를 불러오지 못했어요"
            description="잠시 후 다시 시도해 주세요."
            primaryAction={{
              label: "다시 시도",
              onClick: () => {
                setSdkState("loading");
                setSdkAttempt((attempt) => attempt + 1);
              },
            }}
            className="absolute inset-0 justify-center bg-bg"
          />
        ) : null}

        {sdkState === "ready" && hasRegionLocationError ? (
          <ErrorState
            title={
              hasRegionQueryError
                ? "지역 정보를 불러오지 못했어요"
                : "선택한 지역의 위치를 불러오지 못했어요"
            }
            description="잠시 후 다시 시도해 주세요."
            primaryAction={{
              label: "다시 시도",
              onClick: () => {
                setIsRegionLocationError(false);

                if (hasRegionQueryError || isSelectedRegionMissing) {
                  void regionsQuery.refetch();
                  return;
                }

                setRegionLocationAttempt((attempt) => attempt + 1);
              },
            }}
            className="absolute inset-0 justify-center bg-bg"
          />
        ) : null}

        {isMapReady ? (
          <>
            <Button
              size="pill"
              disabled={!pendingBounds || mapQuery.isFetching}
              className={cn(
                "absolute left-1/2 z-10 h-11 -translate-x-1/2 rounded-full bg-white px-5 text-body-15-semibold text-text shadow-md hover:bg-white",
                selectedPosting ? "bottom-48" : "bottom-5",
              )}
              onClick={handleSearchThisArea}
            >
              이 지역 검색하기
            </Button>
            <IconButton
              label="현재 위치로 이동"
              icon={<LocateFixed />}
              variant="surface"
              className={cn(
                "absolute right-4 z-10 shadow-md",
                controlsBottomClassName,
              )}
              onClick={handleCurrentLocation}
            />
          </>
        ) : null}

        {isMapReady && mapQuery.isLoading ? (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
            <LoadingState
              label="공고를 불러오는 중이에요."
              className="rounded-xl bg-white/90 px-5 py-4 shadow-md"
            />
          </div>
        ) : null}

        {isMapReady && mapQuery.isError ? (
          <div className="absolute inset-x-5 top-5 z-20 rounded-2xl bg-white p-4 shadow-md">
            <ErrorState
              title="공고를 불러오지 못했어요"
              description="잠시 후 다시 시도해 주세요."
              primaryAction={{
                label: "다시 시도",
                onClick: () => void mapQuery.refetch(),
              }}
            />
          </div>
        ) : null}

        {selectedPosting ? (
          <div className="absolute right-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-4 z-20">
            <VolunteerPostingMapCard
              posting={selectedPosting}
              onClick={() => onSelectPosting(selectedPosting.id)}
            />
          </div>
        ) : null}
      </div>
    </BottomSheet>
  );
}
