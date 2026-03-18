/**
 * S3 이미지 URL을 프록시 API(기본적으로 서명된 URL 생성) 라우트로 변환합니다.
 * 주어진 URL이 S3로 끝나는 경우에만 프록시 URL로 감싸서 반환합니다.
 */
export function getProxyImageUrl(url?: string | null): string {
  if (!url || url === 'string') return '';

  // base64, blob 혹은 다른 로컬 경로는 그대로 반환
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
    return url;
  }

  // amazonaws.com 도메인이 포함된 S3 URL인 경우 api/image 로 프록시
  if (url.includes('amazonaws.com')) {
    return `/api/image?url=${encodeURIComponent(url)}`;
  }

  return url;
}
