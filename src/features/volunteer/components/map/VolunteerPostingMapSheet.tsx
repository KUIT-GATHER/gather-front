import { useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
import { toast } from "sonner";

import mapPin from "@/assets/icons/mapPin.svg";
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
  type KakaoMarker,
  type KakaoMarkerImage,
  loadKakaoMapSdk,
} from "@/features/volunteer/lib/kakaoMapSdk";
import {
  getRepresentativeVolunteerPostingLocation,
  isSameVolunteerPostingMapBounds,
  normalizeVolunteerPostingMapBounds,
} from "@/features/volunteer/lib/volunteerPostingMap";
import type { VolunteerPostingFilter } from "@/features/volunteer/types/volunteerPostingFilter.types";
import type {
  VolunteerPostingMapBounds,
  VolunteerPostingMapItem,
} from "@/features/volunteer/types/volunteer.types";
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

type KakaoMaps = Awaited<ReturnType<typeof loadKakaoMapSdk>>;
type SdkState = "loading" | "ready" | "error";
type MarkerImages = {
  normal: KakaoMarkerImage;
  selected: KakaoMarkerImage;
};
type MarkerEntry = {
  marker: KakaoMarker;
  postingId: number;
};
type MapMarkerItem = {
  posting: VolunteerPostingMapItem;
  latitude: number;
  longitude: number;
};

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

function getRegionGeocodeQueries(
  region: Region | undefined,
  parentRegion: Region | undefined,
) {
  if (!region) {
    return [];
  }

  const label = getFullRegionSelectionLabel(region, parentRegion);
  const fallbackLabel = `${label}${
    region.level === REGION_LEVEL.SIGUNGU ? "청" : "시청"
  }`;

  return [...new Set([label, fallbackLabel])];
}

function geocodeRegion(
  maps: KakaoMaps,
  region: Region | undefined,
  parentRegion: Region | undefined,
): Promise<KakaoLatLng | undefined> {
  const queries = getRegionGeocodeQueries(region, parentRegion);

  if (queries.length === 0) {
    return Promise.resolve(undefined);
  }

  const geocoder = new maps.services.Geocoder();

  return new Promise((resolve) => {
    const searchNext = (queryIndex: number) => {
      const query = queries[queryIndex];

      if (!query) {
        resolve(undefined);
        return;
      }

      geocoder.addressSearch(query, (result, status) => {
        const firstResult = result[0];
        const latitude = Number(firstResult?.y);
        const longitude = Number(firstResult?.x);

        if (
          status === maps.services.Status.OK &&
          Number.isFinite(latitude) &&
          Number.isFinite(longitude)
        ) {
          resolve(new maps.LatLng(latitude, longitude));
          return;
        }

        searchNext(queryIndex + 1);
      });
    };

    searchNext(0);
  });
}

function createMarkerImages(maps: KakaoMaps): MarkerImages {
  return {
    normal: new maps.MarkerImage(mapPin, new maps.Size(19, 25), {
      offset: new maps.Point(9.5, 25),
    }),
    selected: new maps.MarkerImage(mapPin, new maps.Size(37, 49), {
      offset: new maps.Point(18.5, 49),
    }),
  };
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
  const markerEntriesRef = useRef<Map<number, MarkerEntry>>(new Map());
  const markerImagesRef = useRef<MarkerImages | undefined>(undefined);
  const [sdkState, setSdkState] = useState<SdkState>("loading");
  const [sdkAttempt, setSdkAttempt] = useState(0);
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
  const shouldWaitForRegion =
    filter.regionId !== undefined && regionsQuery.isPending;

  useEffect(() => {
    let active = true;

    void loadKakaoMapSdk()
      .then((maps) => {
        if (!active) return;
        mapsRef.current = maps;
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
      mapRef.current
    ) {
      return;
    }

    let disposed = false;
    let frameId: number | undefined;
    const map = new maps.Map(container, {
      center: new maps.LatLng(
        DEFAULT_MAP_CENTER.latitude,
        DEFAULT_MAP_CENTER.longitude,
      ),
      level: DEFAULT_MAP_LEVEL,
    });
    const handleIdle = () => {
      if (!disposed) {
        setPendingBounds(getMapBounds(map));
      }
    };

    mapRef.current = map;

    void geocodeRegion(maps, selectedRegion, selectedRegionParent).then(
      (initialCenter) => {
        if (disposed) return;

        if (initialCenter) {
          map.setLevel(getInitialMapLevel(selectedRegion));
          map.setCenter(initialCenter);
        }

        frameId = window.requestAnimationFrame(() => {
          if (disposed) return;

          map.relayout();
          const initialBounds = getMapBounds(map);
          setPendingBounds(initialBounds);
          setSearchedBounds(initialBounds);
          setDisplayedBounds(initialBounds);
          maps.event.addListener(map, "idle", handleIdle);
          setIsMapReady(true);
        });
      },
    );

    return () => {
      disposed = true;
      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId);
      }
      maps.event.removeListener(map, "idle", handleIdle);
      if (mapRef.current === map) {
        mapRef.current = undefined;
      }
    };
  }, [sdkState, selectedRegion, selectedRegionParent, shouldWaitForRegion]);

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

  const markerItems = useMemo<MapMarkerItem[]>(() => {
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

  useEffect(() => {
    const maps = mapsRef.current;
    const map = mapRef.current;

    if (!isMapReady || !maps || !map) {
      return;
    }

    const markerImages = createMarkerImages(maps);
    const markerEntries = markerEntriesRef.current;
    const markerListeners: Array<{
      marker: KakaoMarker;
      handler: () => void;
    }> = [];

    markerImagesRef.current = markerImages;
    markerEntries.forEach(({ marker }) => marker.setMap(null));
    markerEntries.clear();

    markerItems.forEach(({ posting, latitude, longitude }) => {
      const marker = new maps.Marker({
        map,
        position: new maps.LatLng(latitude, longitude),
        image: markerImages.normal,
        zIndex: 1,
      });
      const handleMarkerClick = () => setSelectedPostingId(posting.id);

      maps.event.addListener(marker, "click", handleMarkerClick);
      markerListeners.push({ marker, handler: handleMarkerClick });
      markerEntries.set(posting.id, {
        marker,
        postingId: posting.id,
      });
    });

    return () => {
      markerListeners.forEach(({ marker, handler }) => {
        maps.event.removeListener(marker, "click", handler);
        marker.setMap(null);
      });
      markerEntries.clear();
    };
  }, [isMapReady, markerItems]);

  useEffect(() => {
    const markerImages = markerImagesRef.current;

    if (!markerImages) return;

    markerEntriesRef.current.forEach(({ marker, postingId }) => {
      const isSelected = postingId === selectedPostingId;

      marker.setImage(isSelected ? markerImages.selected : markerImages.normal);
      marker.setZIndex(isSelected ? 2 : 1);
    });
  }, [markerItems, selectedPostingId]);

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

  const isWaitingForMap = sdkState === "ready" && !isMapReady;
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
