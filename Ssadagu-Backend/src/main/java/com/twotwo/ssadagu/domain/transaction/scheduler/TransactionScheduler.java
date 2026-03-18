package com.twotwo.ssadagu.domain.transaction.scheduler;

import com.twotwo.ssadagu.domain.product.entity.Product;
import com.twotwo.ssadagu.domain.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class TransactionScheduler {

    private final ProductRepository productRepository;

    /**
     * 24시간 이상 '거래 중(TRADING)' 상태인 상품을 자동으로 '판매 중(ON_SALE)'으로 복구
     * 매 시간(0분)마다 실행
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupExpiredTradingProducts() {
        log.info("[Scheduler] 만료된 거래 중 상품 확인 시작...");
        
        LocalDateTime expirationTime = LocalDateTime.now().minusHours(24);
        
        // TRADING 상태이면서 수정 일시가 24시간 전인 상품 조회
        // (Product 엔티티의 updatedAt이 거래 시작 시점에 갱신되었다고 가정)
        List<Product> expiredProducts = productRepository.findByStatusAndUpdatedAtBefore("TRADING", expirationTime);
        
        if (expiredProducts.isEmpty()) {
            return;
        }

        log.info("[Scheduler] {}개의 만료된 거래 발견. 상태 복구 진행...", expiredProducts.size());
        
        for (Product product : expiredProducts) {
            product.cancelReservation();
            log.info("[Scheduler] 상품 ID: {} 상태 복구 완료 (TRADING -> ON_SALE)", product.getId());
        }
        
        log.info("[Scheduler] 만료 거래 정리 완료.");
    }
}
