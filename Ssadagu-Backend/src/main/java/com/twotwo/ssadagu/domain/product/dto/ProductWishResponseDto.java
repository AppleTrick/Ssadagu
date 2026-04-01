package com.twotwo.ssadagu.domain.product.dto;

import com.twotwo.ssadagu.domain.product.entity.ProductWish;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "관심 목록 응답 DTO")
public class ProductWishResponseDto {

    @Schema(description = "관심 ID", example = "1")
    private Long id;

    @Schema(description = "상품 ID", example = "10")
    private Long productId;

    @Schema(description = "상품명", example = "맥북 프로 팝니다")
    private String productTitle;

    @Schema(description = "상품 가격", example = "1500000")
    private Long productPrice;

    @Schema(description = "지역명", example = "강남구")
    private String regionName;

    @Schema(description = "썸네일 이미지 URL")
    private String thumbnailUrl;

    public static ProductWishResponseDto from(ProductWish entity) {
        String thumbnail = entity.getProduct().getImages().isEmpty()
                ? null
                : entity.getProduct().getImages().get(0).getImageUrl();

        return ProductWishResponseDto.builder()
                .id(entity.getId())
                .productId(entity.getProduct().getId())
                .productTitle(entity.getProduct().getTitle())
                .productPrice(entity.getProduct().getPrice())
                .regionName(entity.getProduct().getRegionName())
                .thumbnailUrl(thumbnail)
                .build();
    }
}
