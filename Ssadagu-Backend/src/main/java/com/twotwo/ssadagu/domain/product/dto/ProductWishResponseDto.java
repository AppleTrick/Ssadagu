package com.twotwo.ssadagu.domain.product.dto;

import com.twotwo.ssadagu.domain.product.entity.ProductWish;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductWishResponseDto {
    private Long id;

    public static ProductWishResponseDto from(ProductWish entity) {
        return ProductWishResponseDto.builder()
                .id(entity.getId())
                .build();
    }
}
