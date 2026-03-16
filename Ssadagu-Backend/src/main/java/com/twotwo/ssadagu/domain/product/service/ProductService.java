package com.twotwo.ssadagu.domain.product.service;

import com.twotwo.ssadagu.domain.product.dto.ProductCreateRequestDto;
import com.twotwo.ssadagu.domain.product.dto.ProductResponseDto;
import com.twotwo.ssadagu.domain.product.dto.ProductUpdateRequestDto;
import com.twotwo.ssadagu.domain.product.entity.Product;
import com.twotwo.ssadagu.domain.product.repository.ProductRepository;
import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProductResponseDto createProduct(ProductCreateRequestDto request) {
        User seller = userRepository.findById(request.getSellerId())
                .orElseThrow(() -> new IllegalArgumentException("Seller not found"));

        Product product = Product.builder()
                .seller(seller)
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .categoryCode(request.getCategoryCode())
                .regionName(request.getRegionName())
                .status("ON_SALE")
                .wishCount(0)
                .chatCount(0)
                .build();

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            if (request.getImageUrls().size() > 5) {
                throw new IllegalArgumentException("Images cannot exceed 5");
            }
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                com.twotwo.ssadagu.domain.product.entity.ProductImage image = com.twotwo.ssadagu.domain.product.entity.ProductImage.builder()
                        .product(product)
                        .imageUrl(request.getImageUrls().get(i))
                        .sortOrder(i)
                        .build();
                product.getImages().add(image);
            }
        }

        Product savedProduct = productRepository.save(product);
        return ProductResponseDto.from(savedProduct);
    }

    public ProductResponseDto getProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if ("DELETED".equals(product.getStatus()) || product.getDeletedAt() != null) {
            throw new IllegalArgumentException("Product is deleted");
        }

        return ProductResponseDto.from(product);
    }

    public List<ProductResponseDto> getProducts(String regionName) {
        List<Product> products;
        if (regionName != null && !regionName.isBlank()) {
            products = productRepository.findByRegionNameAndStatusNot(regionName, "DELETED");
        } else {
            products = productRepository.findByStatusNot("DELETED");
        }
        return products.stream()
                .filter(p -> p.getDeletedAt() == null)
                .map(ProductResponseDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponseDto updateProduct(Long productId, ProductUpdateRequestDto request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if ("DELETED".equals(product.getStatus()) || product.getDeletedAt() != null) {
            throw new IllegalArgumentException("Product is deleted");
        }

        product.update(
                request.getTitle(),
                request.getDescription(),
                request.getPrice(),
                request.getCategoryCode(),
                request.getRegionName(),
                request.getStatus());

        product.getImages().clear();
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            if (request.getImageUrls().size() > 5) {
                throw new IllegalArgumentException("Images cannot exceed 5");
            }
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                com.twotwo.ssadagu.domain.product.entity.ProductImage image = com.twotwo.ssadagu.domain.product.entity.ProductImage.builder()
                        .product(product)
                        .imageUrl(request.getImageUrls().get(i))
                        .sortOrder(i)
                        .build();
                product.getImages().add(image);
            }
        }

        return ProductResponseDto.from(product);
    }

    @Transactional
    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        product.markAsDeleted();
    }
}
