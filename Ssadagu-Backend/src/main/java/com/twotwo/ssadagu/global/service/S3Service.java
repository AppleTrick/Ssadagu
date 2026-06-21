package com.twotwo.ssadagu.global.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${spring.cloud.aws.region.static}")
    private String region;

    @Value("${s3.public.base-url}")
    private String publicBaseUrl;

    /**
     * 이미지를 S3(MinIO)에 업로드하고 퍼블릭 URL을 반환합니다.
     */
    public String uploadImage(MultipartFile file) {
        String fileName = createFileName(file.getOriginalFilename());
        try (InputStream is = file.getInputStream()) {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(is, file.getSize()));

            // MinIO 공개 경로(path-style): {publicBaseUrl}/{bucket}/{fileName}
            return String.format("%s/%s/%s", publicBaseUrl, bucket, fileName);
        } catch (IOException e) {
            log.error("파일 업로드 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("파일 업로드에 실패했습니다.");
        }
    }

    /**
     * S3에서 이미지를 삭제합니다.
     */
    public void deleteImage(String imageUrl) {
        String fileName = extractFileName(imageUrl);
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(fileName)
                .build();
        s3Client.deleteObject(deleteObjectRequest);
    }

    private String createFileName(String originalFileName) {
        return UUID.randomUUID().toString().concat(getFileExtension(originalFileName));
    }

    private String getFileExtension(String fileName) {
        try {
            return fileName.substring(fileName.lastIndexOf("."));
        } catch (StringIndexOutOfBoundsException e) {
            throw new IllegalArgumentException("잘못된 형식의 파일입니다.");
        }
    }

    private String extractFileName(String imageUrl) {
        return imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
    }
}
