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

    /**
     * [수정됨] 범용 이미지 업로드 메서드
     * @param file 업로드할 파일
     * @param dirName S3 내 저장할 폴더명 (예: "profile", "post")
     * @return 저장된 파일의 S3 URL (DB 저장용)
     */
    public String upload(MultipartFile file, String dirName) throws IOException {
        String originalName = file.getOriginalFilename();
        String extension = "";

        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }

        // 파일명 중복 방지를 위한 UUID 사용
        String key = dirName + "/" + UUID.randomUUID() + extension;

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());

        amazonS3.putObject(bucket, key, file.getInputStream(), metadata);

        // 업로드된 파일의 전체 URL 반환 (DB 저장용)
        return amazonS3.getUrl(bucket, key).toString();
    }

    // 파일 삭제 기능
    public void deleteFile(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        // URL에서 key만 추출하는 로직이 필요할 수 있으나, 여기서는 key를 직접 받는다고 가정
        amazonS3.deleteObject(bucket, key);
    }
}