package com.twotwo.ssadagu.global.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {

    /**
     * Uploads an image and returns the public URL.
     * This is a skeleton implementation. Integrate with S3 or other storage.
     */
    public String uploadImage(MultipartFile file) {
        // Implementation logic (e.g., S3 upload)
        String fileName = file.getOriginalFilename();
        return "https://ssadagu-storage.s3.amazonaws.com/chat/images/" + fileName;
    }
}
