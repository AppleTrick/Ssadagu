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
    private final AIMetadataService aiMetadataService;

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

        List<String> imageUrls = new java.util.ArrayList<>();
        if (imageFiles != null && !imageFiles.isEmpty()) {
            if (imageFiles.size() > 5) {
                throw new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.INVALID_INPUT_VALUE);
            }
            for (int i = 0; i < imageFiles.size(); i++) {
                String imageUrl = s3Service.uploadImage(imageFiles.get(i));
                imageUrls.add(imageUrl);
                com.twotwo.ssadagu.domain.product.entity.ProductImage image = com.twotwo.ssadagu.domain.product.entity.ProductImage.builder()
                        .product(product)
                        .imageUrl(imageUrl)
                        .sortOrder(i)
                        .build();
                product.getImages().add(image);
            }
        }

        // AI를 통해 JSON-LD 메타데이터 생성
        String metadata = aiMetadataService.generateMetadata(
                request.getTitle(),
                request.getDescription(),
                request.getPrice(),
                request.getCategoryCode(),
                request.getRegionName(),
                imageUrls
        );
        if (metadata != null) {
            product.updateMetadata(metadata);
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

    public List<ProductResponseDto> getProducts(String regionName, String title, Long currentUserId) {
        List<Product> products;
        if (regionName != null && !regionName.isBlank() && title != null && !title.isBlank()) {
            // 둘 다 있는 경우 (현재 Repository에는 없으므로 서비스 레벨 필터링 또는 Repository 추가 필요)
            // 여기서는 단순함을 위해 Repository 메서드를 추가하지 않고 필터링으로 처리하거나, 
            // 우선 순위에 따라 하나만 처리할 수 있음. 하지만 사용자 요구사항은 "지역 기반 검색 있지 않나?" 였으므로
            // 둘 다 동작하게 하는 것이 좋음.
            products = productRepository.findByRegionNameAndStatusNotOrderByCreatedAtDesc(regionName, "DELETED");
            products = products.stream()
                    .filter(p -> p.getTitle().contains(title))
                    .collect(Collectors.toList());
        } else if (regionName != null && !regionName.isBlank()) {
            products = productRepository.findByRegionNameAndStatusNotOrderByCreatedAtDesc(regionName, "DELETED");
        } else if (title != null && !title.isBlank()) {
            products = productRepository.findByTitleContainingAndStatusNotOrderByCreatedAtDesc(title, "DELETED");
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

    public List<ProductResponseDto> aiSearchProducts(String keyword, String regionName, Long currentUserId) {
        // 1. 가격 조건 추출 후 가격 표현 제거한 순수 키워드 확보
        PriceRange priceRange = parsePriceRange(keyword);
        String cleanedKeyword = removePriceTerms(keyword);

        // 2. AI로 키워드 확장 (가격 문구 제거 후)
        List<String> allKeywords = new java.util.ArrayList<>();
        if (!cleanedKeyword.isBlank()) {
            allKeywords.addAll(aiMetadataService.expandKeywords(cleanedKeyword));
            allKeywords.add(cleanedKeyword.toLowerCase());
        }

        // 3. 지역 필터링된 상품 목록 조회
        List<Product> products;
        if (regionName != null && !regionName.isBlank()) {
            products = productRepository.findByRegionNameAndStatusNotOrderByCreatedAtDesc(regionName, "DELETED");
        } else {
            products = productRepository.findByStatusNotOrderByCreatedAtDesc("DELETED");
        }

        // 4. 키워드 + 가격 조건 필터링
        return products.stream()
                .filter(p -> p.getDeletedAt() == null)
                .filter(p -> allKeywords.isEmpty() || matchesAnyKeyword(p, allKeywords))
                .filter(p -> priceRange.matches(p.getPrice()))
                .map(p -> {
                    boolean isLiked = currentUserId != null &&
                            productWishRepository.existsByUserIdAndProductId(currentUserId, p.getId());
                    return ProductResponseDto.from(p, currentUserId, isLiked);
                })
                .collect(Collectors.toList());
    }

    private boolean matchesAnyKeyword(Product product, List<String> keywords) {
        String title = product.getTitle() != null ? product.getTitle().toLowerCase() : "";
        String description = product.getDescription() != null ? product.getDescription().toLowerCase() : "";
        String metadata = product.getMetadata() != null ? product.getMetadata().toLowerCase() : "";

        return keywords.stream().anyMatch(kw -> {
            String lowerKw = kw.toLowerCase();
            return title.contains(lowerKw) || description.contains(lowerKw) || metadata.contains(lowerKw);
        });
    }

    /** 검색어에서 가격 범위(최소/최대)를 파싱합니다. */
    private PriceRange parsePriceRange(String query) {
        Long min = null;
        Long max = null;

        // N만원 이하/미만
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("(\\d+(?:\\.\\d+)?)\\s*만\\s*원?\\s*(이하|미만)")
                .matcher(query);
        if (m.find()) {
            long price = (long)(Double.parseDouble(m.group(1)) * 10000);
            max = "미만".equals(m.group(2)) ? price - 1 : price;
        }

        // N원 이하/미만
        m = java.util.regex.Pattern
                .compile("(\\d+)\\s*원\\s*(이하|미만)")
                .matcher(query);
        if (m.find() && max == null) {
            long price = Long.parseLong(m.group(1));
            max = "미만".equals(m.group(2)) ? price - 1 : price;
        }

        // N만원 이상/초과
        m = java.util.regex.Pattern
                .compile("(\\d+(?:\\.\\d+)?)\\s*만\\s*원?\\s*(이상|초과)")
                .matcher(query);
        if (m.find()) {
            long price = (long)(Double.parseDouble(m.group(1)) * 10000);
            min = "초과".equals(m.group(2)) ? price + 1 : price;
        }

        // N원 이상/초과
        m = java.util.regex.Pattern
                .compile("(\\d+)\\s*원\\s*(이상|초과)")
                .matcher(query);
        if (m.find() && min == null) {
            long price = Long.parseLong(m.group(1));
            min = "초과".equals(m.group(2)) ? price + 1 : price;
        }

        return new PriceRange(min, max);
    }

    /** 검색어에서 가격 관련 표현을 제거합니다. */
    private String removePriceTerms(String query) {
        return query
                .replaceAll("\\d+(?:\\.\\d+)?\\s*만\\s*원?\\s*(이하|이상|미만|초과|정도)?", "")
                .replaceAll("\\d+\\s*원\\s*(이하|이상|미만|초과|정도)?", "")
                .replaceAll("\\s{2,}", " ")
                .trim();
    }

    /** 가격 범위 조건 */
    private record PriceRange(Long min, Long max) {
        boolean matches(Long price) {
            if (price == null) return true;
            if (min != null && price < min) return false;
            if (max != null && price > max) return false;
            return true;
        }
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
