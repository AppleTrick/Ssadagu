package com.twotwo.ssadagu.domain.product.controller;

import com.twotwo.ssadagu.domain.product.dto.ProductCreateRequestDto;
import com.twotwo.ssadagu.domain.product.dto.ProductResponseDto;
import com.twotwo.ssadagu.domain.product.dto.ProductUpdateRequestDto;
import com.twotwo.ssadagu.domain.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductResponseDto> createProduct(@RequestBody ProductCreateRequestDto request) {
        ProductResponseDto response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponseDto> getProduct(@PathVariable Long productId) {
        ProductResponseDto response = productService.getProduct(productId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getProducts() {
        List<ProductResponseDto> response = productService.getProducts();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{productId}")
    public ResponseEntity<ProductResponseDto> updateProduct(
            @PathVariable Long productId,
            @RequestBody ProductUpdateRequestDto request) {
        ProductResponseDto response = productService.updateProduct(productId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }
}
