package com.twotwo.ssadagu.domain.product.dto;

import com.twotwo.ssadagu.domain.product.entity.Product;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductResponseDto {
    private Long id;

    public static ProductResponseDto from(Product entity) {
        return ProductResponseDto.builder()
                .id(entity.getId())
                .build();
    }
}
