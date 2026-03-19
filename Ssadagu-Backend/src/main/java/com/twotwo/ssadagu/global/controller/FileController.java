package com.twotwo.ssadagu.global.controller;

import com.twotwo.ssadagu.global.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Slf4j
@Tag(name = "File", description = "파일 업로드 관리 API")
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    private final S3Service s3Service;

    @Operation(summary = "파일 업로드", description = "다중 MultipartFile을 S3에 업로드하고 이미지 URL 목록을 반환합니다.")
    @PostMapping("/upload")
    public ResponseEntity<List<String>> uploadFiles(@RequestPart("files") List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<String> imageUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            String imageUrl = s3Service.uploadImage(file);
            imageUrls.add(imageUrl);
        }

        return ResponseEntity.ok(imageUrls);
    }
}
