package com.twotwo.ssadagu.domain.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Schema(description = "상품 등록 요청 DTO")
public class ProductCreateRequestDto {
    @Schema(description = "판매자 ID", example = "1")
    private Long sellerId;
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
    @Schema(description = "상품 이미지 URL 목록")
    private java.util.List<String> imageUrls;
}
