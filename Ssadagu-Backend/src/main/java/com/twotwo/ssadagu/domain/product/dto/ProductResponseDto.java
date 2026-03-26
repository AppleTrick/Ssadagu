package com.twotwo.ssadagu.domain.product.dto;

import com.twotwo.ssadagu.domain.product.entity.Product;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "상품 응답 DTO")
public class ProductResponseDto {
    @Schema(description = "상품 ID", example = "1")
    private Long id;
    @Schema(description = "판매자 ID", example = "1")
    private Long sellerId;
    @Schema(description = "판매자 닉네임", example = "판매왕")
    private String sellerNickname;
    @Schema(description = "판매자 프로필 이미지 URL")
    private String sellerProfileImageUrl;
    @Schema(description = "상품 제목", example = "맥북 프로 팝니다")
    private String title;
    @Schema(description = "상품 설명", example = "상태 A급 맥북 프로입니다.")
    private String description;
    @Schema(description = "상품 가격", example = "1500000")
    private Long price;
    @Schema(description = "카테고리 코드", example = "ELEC")
    private String categoryCode;
    @Schema(description = "지역명", example = "강남구")
    private String regionName;
    @Schema(description = "상품 상태", example = "ON_SALE")
    private String status;
    @Schema(description = "관심 수", example = "5")
    private Integer wishCount;
    @Schema(description = "채팅 수", example = "2")
    private Integer chatCount;
    @Schema(description = "작성일시")
    private java.time.LocalDateTime createdAt;
    @Schema(description = "수정일시")
    private java.time.LocalDateTime updatedAt;
    @Schema(description = "상품 이미지 목록")
    private java.util.List<ProductImageResponseDto> images;
    @Schema(description = "본인 게시글 여부", example = "true")
    private Boolean isMine;
    @Schema(description = "찜 여부", example = "false")
    private Boolean isLiked;

    public static ProductResponseDto from(Product entity) {
        return from(entity, null, false);
    }

    public static ProductResponseDto from(Product entity, Long currentUserId, boolean isLiked) {
        return from(entity, currentUserId, isLiked, entity.getChatCount());
    }

    public static ProductResponseDto from(Product entity, Long currentUserId, boolean isLiked, int chatCount) {
        return ProductResponseDto.builder()
                .id(entity.getId())
                .sellerId(entity.getSeller().getId())
                .sellerNickname(entity.getSeller().getNickname())
                .sellerProfileImageUrl(entity.getSeller().getProfileImageUrl())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .categoryCode(entity.getCategoryCode())
                .regionName(entity.getRegionName())
                .status(entity.getStatus())
                .wishCount(entity.getWishCount())
                .chatCount(chatCount)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .images(entity.getImages().stream()
                        .map(ProductImageResponseDto::from)
                        .collect(java.util.stream.Collectors.toList()))
                .isMine(currentUserId != null && entity.getSeller().getId().equals(currentUserId))
                .isLiked(isLiked)
                .build();
    }
}
