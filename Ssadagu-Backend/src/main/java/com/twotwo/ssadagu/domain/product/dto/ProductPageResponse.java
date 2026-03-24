package com.twotwo.ssadagu.domain.product.dto;

import java.util.List;

public record ProductPageResponse(
        List<ProductResponseDto> content,
        boolean hasNext,
        int page,
        int size
) {}