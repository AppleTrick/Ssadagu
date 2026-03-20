import { NextRequest, NextResponse } from "next/server";
import { generateS3PresignedUrl } from "@/shared/api/aws";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const urlParam = searchParams.get("url");

  if (!urlParam) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const url = new URL(urlParam);
    const host = url.hostname;
    
    // 환경변수의 버킷 이름과 리전을 통해서 예상되는 호스트를 구성합니다 (보안 픽스)
    const expectedBucketHost = `${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-northeast-2'}.amazonaws.com`;

    // 1. 보안 검증: 다른 버킷이나 외부 도메인일 경우 허용하지 않음 (Open Redirect / IDOR 방지)
    if (host !== expectedBucketHost) {
       return new NextResponse("Forbidden URL host", { status: 403 });
    }
    
    // 2. 키 값 추출 안전하게 처리 
    const key = decodeURIComponent(url.pathname.substring(1));
    const presignedUrl = await generateS3PresignedUrl(key);
    
    return NextResponse.redirect(presignedUrl);

  } catch (error) {
    console.error("Error generating presigned URL:", error);
    // 에러 발생시 악성 URL로 넘어가버리는 Open Redirect (오픈 리다이렉트) 취약점 방지
    return new NextResponse("Internal Server Error or Invalid URL", { status: 500 });
  }
}
