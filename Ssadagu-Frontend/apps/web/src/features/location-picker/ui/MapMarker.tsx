interface MapMarkerProps {
  color?: string;
  size?: number;
}

/**
 * 지도 중심 오버레이용 커스텀 마커 SVG.
 * 포인트는 마커 하단 중앙 — translate(-50%, -100%) 로 배치.
 */
const MapMarker = ({ color = '#3182F6', size = 40 }: MapMarkerProps) => {
  const w = size;
  const h = Math.round(size * 1.35);

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 40 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        <filter id="marker-shadow" x="-30%" y="-10%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.25)" />
        </filter>
        <radialGradient id="marker-grad" cx="38%" cy="32%" r="60%">
          <stop offset="0%" stopColor="#5BA4FF" />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>

      {/* 그림자 타원 */}
      <ellipse cx="20" cy="51" rx="7" ry="2.5" fill="rgba(0,0,0,0.12)" />

      {/* 마커 몸체 */}
      <path
        d="M20 1C10.059 1 2 9.059 2 19c0 12 18 34 18 34S38 31 38 19C38 9.059 29.941 1 20 1z"
        fill="url(#marker-grad)"
        filter="url(#marker-shadow)"
      />

      {/* 외곽 하이라이트 */}
      <path
        d="M20 3C11.163 3 4 10.163 4 19c0 11 17 31.5 16 31.5"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* 흰 원 */}
      <circle cx="20" cy="19" r="8" fill="white" />

      {/* 중앙 점 */}
      <circle cx="20" cy="19" r="3.5" fill={color} />
    </svg>
  );
};

/**
 * Kakao Maps 커스텀 마커 이미지용 SVG 데이터 URL 반환.
 * SharedLocationViewer 등에서 kakao.maps.MarkerImage 생성 시 사용.
 */
export const getMarkerDataUrl = (color = '#3182F6'): string => {
  const svg = `<svg width="40" height="54" viewBox="0 0 40 54" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="s" x="-30%" y="-10%" width="160%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.25)"/>
      </filter>
      <radialGradient id="g" cx="38%" cy="32%" r="60%">
        <stop offset="0%" stop-color="#5BA4FF"/>
        <stop offset="100%" stop-color="${color}"/>
      </radialGradient>
    </defs>
    <ellipse cx="20" cy="51" rx="7" ry="2.5" fill="rgba(0,0,0,0.12)"/>
    <path d="M20 1C10.059 1 2 9.059 2 19c0 12 18 34 18 34S38 31 38 19C38 9.059 29.941 1 20 1z" fill="url(#g)" filter="url(#s)"/>
    <circle cx="20" cy="19" r="8" fill="white"/>
    <circle cx="20" cy="19" r="3.5" fill="${color}"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export default MapMarker;
