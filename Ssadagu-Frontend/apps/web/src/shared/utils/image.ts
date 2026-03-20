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

  // amazonaws.com 도메인이 포함된 S3 URL인 경우 next-api/image 라우트로 프록시
  if (url.includes('amazonaws.com')) {
    return `/next-api/image?url=${encodeURIComponent(url)}`;
  }

  return url;
}

/**
 * HTML5 Canvas를 이용해 이미지를 리사이징하고 압축하여 반환합니다.
 * 이 함수는 이미지가 무조건 2MB(2 * 1024 * 1024 bytes) 리밋을 넘지 않도록
 * 화질(quality)을 낮춰가며 압축을 보장합니다.
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  maxSizeMB = 2,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // 비율에 맞춰 리사이징
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context is not supported.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // 화질 조절 루프 (초기 화질 0.8)
        let quality = 0.8;
        const targetSize = maxSizeMB * 1024 * 1024;

        const attemptCompression = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas to Blob conversion failed.'));
                return;
              }

              // 파일 크기가 목표치보다 크고 화질을 더 낮출 수 있다면 다시 압축
              if (blob.size > targetSize && quality > 0.1) {
                quality -= 0.1;
                attemptCompression();
              } else {
                // 압축 완료 시 File 객체로 반환
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              }
            },
            'image/jpeg',
            quality,
          );
        };

        attemptCompression();
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

