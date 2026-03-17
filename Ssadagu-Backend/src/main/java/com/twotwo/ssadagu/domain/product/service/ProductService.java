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
    private final com.twotwo.ssadagu.domain.product.repository.ProductWishRepository productWishRepository;
    private final com.twotwo.ssadagu.global.service.S3Service s3Service;

    @Transactional
    public ProductResponseDto createProduct(ProductCreateRequestDto request, List<org.springframework.web.multipart.MultipartFile> imageFiles) {
        User seller = userRepository.findById(request.getSellerId())
                .orElseThrow(() -> new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.USER_NOT_FOUND));

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
                .images(new java.util.ArrayList<>())
                .build();

        if (imageFiles != null && !imageFiles.isEmpty()) {
            if (imageFiles.size() > 5) {
                throw new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.INVALID_INPUT_VALUE);
            }
            for (int i = 0; i < imageFiles.size(); i++) {
                String imageUrl = s3Service.uploadImage(imageFiles.get(i));
                com.twotwo.ssadagu.domain.product.entity.ProductImage image = com.twotwo.ssadagu.domain.product.entity.ProductImage.builder()
                        .product(product)
                        .imageUrl(imageUrl)
                        .sortOrder(i)
                        .build();
                product.getImages().add(image);
            }
        }

        Product savedProduct = productRepository.save(product);
        return ProductResponseDto.from(savedProduct, seller.getId(), false);
    }

    public ProductResponseDto getProduct(Long productId, Long currentUserId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.PRODUCT_NOT_FOUND));

        if ("DELETED".equals(product.getStatus()) || product.getDeletedAt() != null) {
            throw new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.PRODUCT_NOT_FOUND);
        }

        boolean isLiked = false;
        if (currentUserId != null) {
            isLiked = productWishRepository.existsByUserIdAndProductId(currentUserId, productId);
        }

        return ProductResponseDto.from(product, currentUserId, isLiked);
    }

    public List<ProductResponseDto> getProducts(String regionName, Long currentUserId) {
        List<Product> products;
        if (regionName != null && !regionName.isBlank()) {
            products = productRepository.findByRegionNameAndStatusNotOrderByCreatedAtDesc(regionName, "DELETED");
        } else {
            products = productRepository.findByStatusNotOrderByCreatedAtDesc("DELETED");
        }
        
        return products.stream()
                .filter(p -> p.getDeletedAt() == null)
                .map(p -> {
                    boolean isLiked = false;
                    if (currentUserId != null) {
                        isLiked = productWishRepository.existsByUserIdAndProductId(currentUserId, p.getId());
                    }
                    return ProductResponseDto.from(p, currentUserId, isLiked);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponseDto updateProduct(Long productId, ProductUpdateRequestDto request, List<org.springframework.web.multipart.MultipartFile> imageFiles, Long currentUserId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.PRODUCT_NOT_FOUND));

        // 삭제 확인
        if ("DELETED".equals(product.getStatus()) || product.getDeletedAt() != null) {
            throw new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.PRODUCT_NOT_FOUND);
        }

        // 권한 확인
        if (!product.getSeller().getId().equals(currentUserId)) {
            throw new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.NOT_PRODUCT_SELLER);
        }

        product.update(
                request.getTitle(),
                request.getDescription(),
                request.getPrice(),
                request.getCategoryCode(),
                request.getRegionName(),
                request.getStatus());

        if (imageFiles != null && !imageFiles.isEmpty()) {
            if (imageFiles.size() > 5) {
                throw new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.INVALID_INPUT_VALUE);
            }
            // 기존 이미지 삭제 (S3에서도 삭제 연동 시 여기에 추가 가능)
            product.getImages().clear();
            for (int i = 0; i < imageFiles.size(); i++) {
                String imageUrl = s3Service.uploadImage(imageFiles.get(i));
                com.twotwo.ssadagu.domain.product.entity.ProductImage image = com.twotwo.ssadagu.domain.product.entity.ProductImage.builder()
                        .product(product)
                        .imageUrl(imageUrl)
                        .sortOrder(i)
                        .build();
                product.getImages().add(image);
            }
        }

        boolean isLiked = productWishRepository.existsByUserIdAndProductId(currentUserId, productId);
        return ProductResponseDto.from(product, currentUserId, isLiked);
    }

    @Transactional
    public void deleteProduct(Long productId, Long currentUserId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.PRODUCT_NOT_FOUND));

        // 권한 확인
        if (!product.getSeller().getId().equals(currentUserId)) {
            throw new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.NOT_PRODUCT_SELLER);
        }

        product.markAsDeleted();
    }
}
