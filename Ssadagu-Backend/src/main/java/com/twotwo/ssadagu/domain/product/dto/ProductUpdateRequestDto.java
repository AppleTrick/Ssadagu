package com.twotwo.ssadagu.domain.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Schema(description = "상품 수정 요청 DTO")
public class ProductUpdateRequestDto {
    @Schema(description = "상품 제목", example = "맥북 프로 팝니다(가격내림)")
    private String title;
    @Schema(description = "상품 설명", example = "상태 A급 맥북 프로입니다. 가격 내렸어요.")
    private String description;
    @Schema(description = "상품 가격", example = "1400000")
    private Long price;
    @Schema(description = "카테고리 코드", example = "ELEC")
    private String categoryCode;
    @Schema(description = "지역명", example = "강남구")
    private String regionName;
    @Schema(description = "상품 상태", example = "ON_SALE")
    private String status;
}
