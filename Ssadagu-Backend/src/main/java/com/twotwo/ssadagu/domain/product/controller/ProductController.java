package com.twotwo.ssadagu.domain.product.controller;

import com.twotwo.ssadagu.domain.product.dto.ProductCreateRequestDto;
import com.twotwo.ssadagu.domain.product.dto.ProductResponseDto;
import com.twotwo.ssadagu.domain.product.dto.ProductUpdateRequestDto;
import com.twotwo.ssadagu.domain.product.service.ProductService;
import com.twotwo.ssadagu.domain.product.service.ProductWishService;
import com.twotwo.ssadagu.global.security.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Product", description = "상품 관리 API")
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductWishService productWishService;

    @Operation(summary = "상품 등록", description = "새로운 상품을 등록합니다.")
    @PostMapping
    public ResponseEntity<ProductResponseDto> createProduct(@RequestBody ProductCreateRequestDto request) {
        ProductResponseDto response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "상품 상세 조회", description = "특정 상품의 상세 정보를 조회합니다.")
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponseDto> getProduct(@PathVariable Long productId) {
        ProductResponseDto response = productService.getProduct(productId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "상품 목록 조회", description = "상품 목록을 조회합니다. regionName 파라미터로 동네별 필터링이 가능합니다.")
    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getProducts(
            @RequestParam(required = false) String regionName) {
        List<ProductResponseDto> response = productService.getProducts(regionName);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "상품 수정", description = "등록된 상품 정보를 수정합니다.")
    @PatchMapping("/{productId}")
    public ResponseEntity<ProductResponseDto> updateProduct(
            @PathVariable Long productId,
            @RequestBody ProductUpdateRequestDto request) {
        ProductResponseDto response = productService.updateProduct(productId, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "상품 삭제", description = "상품을 삭제합니다.")
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "상품 찜/취소", description = "특정 상품을 찜하거나 찜을 취소합니다.")
    @PostMapping("/{productId}/wish")
    public ResponseEntity<Void> toggleWish(
            @PathVariable Long productId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        productWishService.toggleWish(userDetails.getUser().getId(), productId);
        return ResponseEntity.ok().build();
    }
}
