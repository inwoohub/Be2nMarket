// src/main/java/com/example/service/S3Uploader.java
package com.example.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Uploader {

    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    public String uploadProfileImage(Long userId, MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename();
        String extension = "";

        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }

        String key = "profile/" + userId + "/" + UUID.randomUUID() + extension;

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());

        amazonS3.putObject(bucket, key, file.getInputStream(), metadata);

        return key;
    }

    public String getFileUrl(String key) {
        if (key == null || key.isBlank()) {
            return "";
        }
        return amazonS3.getUrl(bucket, key).toString();
    }

    public void deleteFile(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        amazonS3.deleteObject(bucket, key);
    }

}
