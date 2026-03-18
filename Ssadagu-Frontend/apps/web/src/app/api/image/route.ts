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

    if (!host.includes("amazonaws.com")) {
       return NextResponse.redirect(urlParam);
    }
    
    const key = url.pathname.substring(1);
    const presignedUrl = await generateS3PresignedUrl(key);
    
    return NextResponse.redirect(presignedUrl);

  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.redirect(urlParam);
  }
}
