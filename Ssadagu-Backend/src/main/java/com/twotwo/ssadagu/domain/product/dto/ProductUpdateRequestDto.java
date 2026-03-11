package com.twotwo.ssadagu.domain.product.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ProductUpdateRequestDto {
    private String title;
    private String description;
    private Long price;
    private String categoryCode;
    private String regionName;
    private String status;
}
