import { useEffect, useRef } from "react";

import mapPin from "@/assets/icons/mapPin.svg";
import type {
  KakaoMap,
  KakaoMarkerClusterer,
  KakaoMaps,
  KakaoMarker,
  KakaoMarkerImage,
} from "@/features/volunteer/lib/kakaoMapSdk";
import type { VolunteerPostingMapItem } from "@/features/volunteer/types/volunteer.types";

const MAP_CLUSTER_GRID_SIZE = 60;
const MAP_CLUSTER_MIN_LEVEL = 6;
const MAP_CLUSTER_MIN_SIZE = 2;
const MAP_CLUSTER_SIZE = 42;

export type VolunteerPostingMapMarkerItem = {
  posting: VolunteerPostingMapItem;
  latitude: number;
  longitude: number;
};

type MarkerImages = {
  normal: KakaoMarkerImage;
  selected: KakaoMarkerImage;
};

type MarkerEntry = {
  marker: KakaoMarker;
  postingId: number;
  clickHandler: () => void;
};

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

function clearMarkerEntries(
  maps: KakaoMaps,
  markerEntries: Map<number, MarkerEntry>,
) {
  markerEntries.forEach(({ marker, clickHandler }) => {
    maps.event.removeListener(marker, "click", clickHandler);
  });
  markerEntries.clear();
}

export function useVolunteerPostingMapMarkers({
  maps,
  map,
  isMapReady,
  markerItems,
  selectedPostingId,
  onSelectPosting,
  onClusterClick,
}: {
  maps: KakaoMaps | undefined;
  map: KakaoMap | undefined;
  isMapReady: boolean;
  markerItems: readonly VolunteerPostingMapMarkerItem[];
  selectedPostingId: number | null;
  onSelectPosting: (postingId: number) => void;
  onClusterClick: () => void;
}) {
  const markerEntriesRef = useRef<Map<number, MarkerEntry>>(new Map());
  const markerImagesRef = useRef<MarkerImages | undefined>(undefined);
  const clustererRef = useRef<KakaoMarkerClusterer | null>(null);

  useEffect(() => {
    if (!isMapReady || !maps || !map) {
      return;
    }

    const clusterer = new maps.MarkerClusterer({
      map,
      gridSize: MAP_CLUSTER_GRID_SIZE,
      averageCenter: true,
      minLevel: MAP_CLUSTER_MIN_LEVEL,
      minClusterSize: MAP_CLUSTER_MIN_SIZE,
      disableClickZoom: false,
      styles: [
        {
          width: `${MAP_CLUSTER_SIZE}px`,
          height: `${MAP_CLUSTER_SIZE}px`,
          background: "#F76073",
          borderRadius: "50%",
          color: "#fff",
          textAlign: "center",
          fontWeight: "600",
          lineHeight: `${MAP_CLUSTER_SIZE}px`,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.16)",
        },
      ],
    });

    clustererRef.current = clusterer;
    markerImagesRef.current = createMarkerImages(maps);
    const markerEntries = markerEntriesRef.current;
    const handleClusterClick = () => onClusterClick();

    maps.event.addListener(clusterer, "clusterclick", handleClusterClick);

    return () => {
      maps.event.removeListener(clusterer, "clusterclick", handleClusterClick);
      clusterer.clear();
      clearMarkerEntries(maps, markerEntries);

      if (clustererRef.current === clusterer) {
        clustererRef.current = null;
        markerImagesRef.current = undefined;
      }
    };
  }, [isMapReady, map, maps, onClusterClick]);

  useEffect(() => {
    if (!isMapReady || !maps || !map) {
      return;
    }

    const clusterer = clustererRef.current;
    const markerImages = markerImagesRef.current;

    if (!clusterer || !markerImages) {
      return;
    }

    const markerEntries = markerEntriesRef.current;

    clusterer.clear();
    clearMarkerEntries(maps, markerEntries);

    const markers: KakaoMarker[] = [];

    markerItems.forEach(({ posting, latitude, longitude }) => {
      const marker = new maps.Marker({
        position: new maps.LatLng(latitude, longitude),
        image: markerImages.normal,
        zIndex: 1,
      });
      const clickHandler = () => onSelectPosting(posting.id);

      maps.event.addListener(marker, "click", clickHandler);
      markerEntriesRef.current.set(posting.id, {
        marker,
        postingId: posting.id,
        clickHandler,
      });
      markers.push(marker);
    });

    clusterer.addMarkers(markers);

    return () => {
      clusterer.clear();
      clearMarkerEntries(maps, markerEntries);
    };
  }, [isMapReady, map, maps, markerItems, onSelectPosting]);

  useEffect(() => {
    const markerImages = markerImagesRef.current;

    if (!markerImages) {
      return;
    }

    markerEntriesRef.current.forEach(({ marker, postingId }) => {
      const isSelected = postingId === selectedPostingId;

      marker.setImage(isSelected ? markerImages.selected : markerImages.normal);
      marker.setZIndex(isSelected ? 2 : 1);
    });
  }, [markerItems, selectedPostingId]);
}
