import { env } from "@/shared/config/env";

export type KakaoLatLng = {
  getLat: () => number;
  getLng: () => number;
};

export type KakaoLatLngBounds = {
  getSouthWest: () => KakaoLatLng;
  getNorthEast: () => KakaoLatLng;
};

export type KakaoMap = {
  getBounds: () => KakaoLatLngBounds;
  setCenter: (position: KakaoLatLng) => void;
  panTo: (position: KakaoLatLng) => void;
  setLevel: (level: number) => void;
  relayout: () => void;
};

export type KakaoMarkerImage = object;

export type KakaoMarker = {
  setMap: (map: KakaoMap | null) => void;
  setImage: (image: KakaoMarkerImage) => void;
  setZIndex: (zIndex: number) => void;
};

export type KakaoMarkerClusterer = {
  addMarkers: (markers: KakaoMarker[], nodraw?: boolean) => void;
  clear: () => void;
  redraw: () => void;
};

export type KakaoMarkerClustererOptions = {
  map: KakaoMap;
  markers?: KakaoMarker[];
  gridSize?: number;
  averageCenter?: boolean;
  minLevel?: number;
  minClusterSize?: number;
  styles?: Array<Record<string, string>>;
  texts?: string[] | ((size: number) => string);
  disableClickZoom?: boolean;
};

export type KakaoAddressSearchResult = {
  x: string;
  y: string;
};

export type KakaoKeywordSearchResult = {
  x: string;
  y: string;
};

export type KakaoMaps = {
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number },
  ) => KakaoMap;
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  Marker: new (options: {
    position: KakaoLatLng;
    map?: KakaoMap;
    image?: KakaoMarkerImage;
    zIndex?: number;
  }) => KakaoMarker;
  MarkerImage: new (
    src: string,
    size: object,
    options: { offset: object },
  ) => KakaoMarkerImage;
  MarkerClusterer: new (
    options: KakaoMarkerClustererOptions,
  ) => KakaoMarkerClusterer;
  Size: new (width: number, height: number) => object;
  Point: new (x: number, y: number) => object;
  event: {
    addListener: (
      target: KakaoMap | KakaoMarker | KakaoMarkerClusterer,
      event: string,
      handler: () => void,
    ) => void;
    removeListener: (
      target: KakaoMap | KakaoMarker | KakaoMarkerClusterer,
      event: string,
      handler: () => void,
    ) => void;
  };
  load: (callback: () => void) => void;
  services: {
    Geocoder: new () => {
      addressSearch: (
        query: string,
        callback: (result: KakaoAddressSearchResult[], status: string) => void,
      ) => void;
    };
    Places: new () => {
      keywordSearch: (
        query: string,
        callback: (result: KakaoKeywordSearchResult[], status: string) => void,
      ) => void;
    };
    Status: {
      OK: string;
    };
  };
};

declare global {
  interface Window {
    kakao?: {
      maps?: KakaoMaps;
    };
  }
}

const KAKAO_MAP_SCRIPT_ID = "gather-kakao-map-sdk";

let kakaoMapSdkPromise: Promise<KakaoMaps> | undefined;

function getLoadedKakaoMaps() {
  return window.kakao?.maps;
}

function removeKakaoMapScript() {
  document.getElementById(KAKAO_MAP_SCRIPT_ID)?.remove();
}

export function loadKakaoMapSdk(): Promise<KakaoMaps> {
  const loadedMaps = getLoadedKakaoMaps();

  if (loadedMaps) {
    return Promise.resolve(loadedMaps);
  }

  if (kakaoMapSdkPromise) {
    return kakaoMapSdkPromise;
  }

  kakaoMapSdkPromise = new Promise<KakaoMaps>((resolve, reject) => {
    removeKakaoMapScript();

    const script = document.createElement("script");
    script.id = KAKAO_MAP_SCRIPT_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&libraries=services,clusterer&appkey=${encodeURIComponent(
      env.KAKAO_MAP_JAVASCRIPT_KEY,
    )}`;

    const rejectLoad = () => {
      removeKakaoMapScript();
      reject(new Error("Kakao Maps SDK를 불러오지 못했어요."));
    };

    script.addEventListener(
      "load",
      () => {
        const maps = getLoadedKakaoMaps();

        if (!maps) {
          rejectLoad();
          return;
        }

        try {
          maps.load(() => resolve(maps));
        } catch {
          rejectLoad();
        }
      },
      { once: true },
    );
    script.addEventListener("error", rejectLoad, { once: true });
    document.head.append(script);
  }).catch((error: unknown) => {
    kakaoMapSdkPromise = undefined;
    throw error;
  });

  return kakaoMapSdkPromise;
}
