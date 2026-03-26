package com.twotwo.ssadagu.domain.product.service;

import com.twotwo.ssadagu.domain.product.dto.ProductCreateRequestDto;
import com.twotwo.ssadagu.domain.product.dto.ProductPageResponse;
import com.twotwo.ssadagu.domain.product.dto.ProductResponseDto;
import com.twotwo.ssadagu.domain.product.dto.ProductUpdateRequestDto;
import com.twotwo.ssadagu.domain.product.dto.SearchFilterDto;
import com.twotwo.ssadagu.domain.product.entity.Product;
import com.twotwo.ssadagu.domain.product.repository.ProductRepository;
import com.twotwo.ssadagu.domain.product.repository.ProductSpecification;
import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
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
    private final ProductMetadataAsyncService metadataAsyncService;

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

        Product savedProduct = productRepository.save(product);

        // 트랜잭션 커밋 후 AI 메타데이터를 백그라운드에서 생성 (응답 지연 없음)
        final Long savedId = savedProduct.getId();
        final List<String> finalImageUrls = new ArrayList<>(imageUrls);
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                metadataAsyncService.generateAndApply(
                        savedId,
                        request.getTitle(), request.getDescription(),
                        request.getPrice(), request.getCategoryCode(),
                        request.getRegionName(), finalImageUrls);
            }
        });

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

    public ProductPageResponse getProducts(String regionName, String keyword, int page, int size, Long currentUserId) {
        Specification<Product> spec = Specification.where(ProductSpecification.notDeleted());

        if (regionName != null && !regionName.isBlank()) {
            spec = spec.and(ProductSpecification.regionEquals(regionName));
        }
        if (keyword != null && !keyword.isBlank()) {
            spec = spec.and(ProductSpecification.titleContains(keyword));
        }

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> productPage = productRepository.findAll(spec, pageRequest);

        List<ProductResponseDto> content = toResponseList(productPage.getContent(), currentUserId);
        return new ProductPageResponse(content, productPage.hasNext(), page, size);
    }

    @Transactional
    public ProductResponseDto updateProduct(Long productId, ProductUpdateRequestDto request, List<org.springframework.web.multipart.MultipartFile> imageFiles, Long currentUserId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.PRODUCT_NOT_FOUND));

        if ("DELETED".equals(product.getStatus()) || product.getDeletedAt() != null) {
            throw new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.PRODUCT_NOT_FOUND);
        }

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

        // 1. 기존 이미지 중 유지할 이미지 선별 (imageUrls 필드가 null이 아닌 경우 적용)
        List<String> keepUrls = request.getImageUrls();
        if (keepUrls != null) {
            product.getImages().removeIf(img -> !keepUrls.contains(img.getImageUrl()));
        }

        // 2. 새 이미지 업로드 및 추가
        if (imageFiles != null && !imageFiles.isEmpty()) {
            if (product.getImages().size() + imageFiles.size() > 5) {
                throw new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.INVALID_INPUT_VALUE);
            }
            for (org.springframework.web.multipart.MultipartFile file : imageFiles) {
                String imageUrl = s3Service.uploadImage(file);
                com.twotwo.ssadagu.domain.product.entity.ProductImage image = com.twotwo.ssadagu.domain.product.entity.ProductImage.builder()
                        .product(product)
                        .imageUrl(imageUrl)
                        .sortOrder(product.getImages().size())
                        .build();
                product.getImages().add(image);
            }
        }

        // 3. 전체 이미지 URL 리스트 (AI 메타데이터용)
        final List<String> allImageUrls = product.getImages().stream()
                .map(com.twotwo.ssadagu.domain.product.entity.ProductImage::getImageUrl)
                .collect(Collectors.toList());

        // 트랜잭션 커밋 후 AI 메타데이터를 백그라운드에서 재생성 (응답 지연 없음)
        final Long asyncProductId = product.getId();
        final String asyncTitle = product.getTitle();
        final String asyncDesc = product.getDescription();
        final Long asyncPrice = product.getPrice();
        final String asyncCategory = product.getCategoryCode();
        final String asyncRegion = product.getRegionName();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                metadataAsyncService.generateAndApply(
                        asyncProductId, asyncTitle, asyncDesc,
                        asyncPrice, asyncCategory, asyncRegion, allImageUrls);
            }
        });

        boolean isLiked = productWishRepository.existsByUserIdAndProductId(currentUserId, productId);
        return ProductResponseDto.from(product, currentUserId, isLiked);
    }

    /**
     * Text-to-Filter 기반 AI 검색.
     *
     * 1단계: 규칙 기반 전처리 - 가격 조건 추출 + stopword 제거
     * 2단계: LLM → SearchFilterDto (브랜드/제품명/색상 + 유사어 확장)
     * 3단계: 필드 기반 정밀 검색 Specification 조합 → DB 직접 필터링 + 페이지네이션
     */
    public ProductPageResponse aiSearchProducts(String keyword, String regionName, int page, int size, Long currentUserId) {
        // 1단계: 가격 추출 + stopword 토큰 제거
        PriceRange priceRange = parsePriceRange(keyword);
        String cleanedKeyword = removeStopwords(removePriceTerms(keyword));

        // 2단계: LLM → SearchFilterDto
        SearchFilterDto filter = SearchFilterDto.empty();
        if (!cleanedKeyword.isBlank()) {
            filter = aiMetadataService.buildSearchFilter(cleanedKeyword);
        }

        SearchFilterDto.Filters llmFilters = filter.getFilters();
        SearchFilterDto.Expanded llmExpanded = filter.getExpanded();

        // 3단계: Specification 조합
        // 가격: rule-based 우선, 없으면 LLM 필터 값 fallback
        Long effectiveMin = priceRange.min() != null ? priceRange.min()
                : (llmFilters != null ? llmFilters.getMinPrice() : null);
        Long effectiveMax = priceRange.max() != null ? priceRange.max()
                : (llmFilters != null ? llmFilters.getMaxPrice() : null);

        Specification<Product> spec = Specification.where(ProductSpecification.notDeleted());

        // 하드 필터: 지역/가격/카테고리/상태
        if (regionName != null && !regionName.isBlank()) {
            spec = spec.and(ProductSpecification.regionEquals(regionName));
        }
        if (effectiveMin != null) spec = spec.and(ProductSpecification.minPrice(effectiveMin));
        if (effectiveMax != null) spec = spec.and(ProductSpecification.maxPrice(effectiveMax));
        if (llmFilters != null && llmFilters.getCategory() != null) {
            spec = spec.and(ProductSpecification.categoryEquals(llmFilters.getCategory()));
        }
        if (llmFilters != null && llmFilters.getCondition() != null) {
            spec = spec.and(ProductSpecification.conditionEquals(llmFilters.getCondition()));
        }

        // 필드 기반 정밀 검색: 브랜드/제품명 (기존 상품은 metadata LIKE fallback)
        List<String> brandTerms = collectTerms(llmFilters != null ? llmFilters.getBrand() : null,
                llmExpanded != null ? llmExpanded.getBrandAliases() : null);
        List<String> productTerms = collectTerms(llmFilters != null ? llmFilters.getProductName() : null,
                llmExpanded != null ? llmExpanded.getProductAliases() : null);
        List<String> colorTerms = collectTerms(null,
                llmExpanded != null ? llmExpanded.getColorAliases() : null);
        if (llmFilters != null && llmFilters.getColors() != null) colorTerms.addAll(llmFilters.getColors());

        if (!brandTerms.isEmpty()) {
            // 브랜드 필드 매칭 OR searchAliases 매칭 (title/description은 제외해 false positive 방지)
            spec = spec.and(
                ProductSpecification.brandFieldMatch(brandTerms)
                    .or(ProductSpecification.searchAliasesMatch(brandTerms))
            );
        }
        if (!productTerms.isEmpty()) {
            // 제품명 필드 매칭 OR searchAliases 매칭
            // "크루넥"처럼 LLM이 productName으로 분류했지만 searchAliases에만 있는 경우도 검색되도록
            spec = spec.and(
                ProductSpecification.productNameFieldMatch(productTerms)
                    .or(ProductSpecification.searchAliasesMatch(productTerms))
            );
        }
        if (!colorTerms.isEmpty()) {
            spec = spec.and(ProductSpecification.colorFieldMatch(colorTerms));
        }

        // 브랜드/제품명 필드 검색이 모두 없을 때 keywordsMatch fallback
        if (brandTerms.isEmpty() && productTerms.isEmpty()) {
            List<String> coreTerms = filter.collectCoreTerms();
            List<String> optionalTerms = filter.collectOptionalTerms();
            if (!coreTerms.isEmpty()) {
                spec = spec.and(ProductSpecification.keywordsMatch(coreTerms));
            } else if (!optionalTerms.isEmpty()) {
                spec = spec.and(ProductSpecification.keywordsMatch(optionalTerms));
            } else if (!cleanedKeyword.isBlank()) {
                spec = spec.and(ProductSpecification.keywordsMatch(List.of(cleanedKeyword.toLowerCase())));
            }
        }

        // Phase 3: sort 실제 반영
        Sort sortOrder = resolveSort(filter.getSort());
        PageRequest pageRequest = PageRequest.of(page, size, sortOrder);
        Page<Product> productPage = productRepository.findAll(spec, pageRequest);

        List<ProductResponseDto> content = toResponseList(productPage.getContent(), currentUserId);
        return new ProductPageResponse(content, productPage.hasNext(), page, size);
    }

    /** LLM sort 값을 Spring Sort로 변환합니다. */
    private Sort resolveSort(String sort) {
        if (sort == null) return Sort.by("createdAt").descending();
        return switch (sort) {
            case "PRICE_ASC"  -> Sort.by("price").ascending();
            case "PRICE_DESC" -> Sort.by("price").descending();
            default           -> Sort.by("createdAt").descending();
        };
    }

    /** canonical값 + alias 리스트를 합쳐 dedup된 term 리스트를 반환합니다. */
    private List<String> collectTerms(String canonical, List<String> aliases) {
        java.util.LinkedHashSet<String> set = new java.util.LinkedHashSet<>();
        if (canonical != null && !canonical.isBlank()) set.add(canonical.trim());
        if (aliases != null) aliases.stream().filter(a -> a != null && !a.isBlank()).forEach(set::add);
        return new ArrayList<>(set);
    }

    /**
     * 상품 목록 → DTO 변환. 찜 여부를 한 번의 쿼리로 일괄 조회해 N+1을 방지합니다.
     * currentUserId가 없으면 모두 isLiked=false 처리합니다.
     */
    private List<ProductResponseDto> toResponseList(List<Product> products, Long currentUserId) {
        Set<Long> likedIds = (currentUserId != null && !products.isEmpty())
                ? productWishRepository.findLikedProductIds(
                        currentUserId,
                        products.stream().map(Product::getId).collect(Collectors.toList()))
                : Collections.emptySet();

        return products.stream()
                .map(p -> ProductResponseDto.from(p, currentUserId, likedIds.contains(p.getId())))
                .collect(Collectors.toList());
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
    private record PriceRange(Long min, Long max) {}

    private static final Set<String> STOPWORDS = Set.of(
            "제품", "물건", "상품", "중고", "판매", "구매", "급처", "나눔", "삽니다", "팝니다",
            "거래", "직거래", "택배", "팔아요", "삼", "팜", "구함");

    /**
     * 검색어를 토큰으로 분리한 뒤 stopword 토큰을 제거하고 재조합합니다.
     * 기존 전체 문자열 비교 방식 대신 토큰 단위로 처리해 부분 제거가 가능합니다.
     * 예) "중고 맥북 팝니다" → "맥북"
     */
    private String removeStopwords(String keyword) {
        if (keyword == null || keyword.isBlank()) return "";
        String[] tokens = keyword.trim().split("\\s+");
        String result = java.util.Arrays.stream(tokens)
                .filter(t -> !STOPWORDS.contains(t.toLowerCase()))
                .collect(Collectors.joining(" "));
        return result.trim();
    }

    @Transactional
    public void deleteProduct(Long productId, Long currentUserId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.PRODUCT_NOT_FOUND));

        if (!product.getSeller().getId().equals(currentUserId)) {
            throw new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.NOT_PRODUCT_SELLER);
        }

        product.markAsDeleted();
    }
}