package com.twotwo.ssadagu.domain.product.service;

import com.twotwo.ssadagu.domain.product.entity.Product;
import com.twotwo.ssadagu.domain.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * AI 메타데이터 생성을 백그라운드에서 처리합니다.
 * 상품 등록/수정 시 즉시 응답하고, 메타데이터는 이 서비스에서 비동기로 채웁니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductMetadataAsyncService {

    private final ProductRepository productRepository;
    private final AIMetadataService aiMetadataService;

    @Async
    @Transactional
    public void generateAndApply(Long productId, String title, String description,
                                  Long price, String categoryCode, String regionName,
                                  List<String> imageUrls) {
        try {
            String metadata = aiMetadataService.generateMetadata(
                    title, description, price, categoryCode, regionName, imageUrls);

            if (metadata == null) {
                log.warn("AI 메타데이터 생성 결과 없음 - productId: {}", productId);
                return;
            }

            Product product = productRepository.findById(productId).orElse(null);
            if (product == null) {
                log.warn("메타데이터 업데이트 대상 상품 없음 - productId: {}", productId);
                return;
            }

            AIMetadataService.MetadataFields fields = aiMetadataService.extractMetadataFields(metadata);
            product.updateMetadata(metadata);
            product.updateMetadataFields(
                    fields.brand(), fields.productName(), fields.modelName(),
                    fields.canonicalColors(), fields.condition(), fields.searchAliases());

            log.debug("AI 메타데이터 적용 완료 - productId: {}", productId);
        } catch (Exception e) {
            log.error("AI 메타데이터 비동기 처리 실패 - productId: {}", productId, e);
        }
    }
}
