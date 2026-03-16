package com.twotwo.ssadagu.domain.transaction.dto;

import com.twotwo.ssadagu.domain.transaction.entity.Transaction;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@Schema(description = "거래 내역 응답 DTO")
public class TransactionResponseDto {

    @Schema(description = "거래 ID", example = "1")
    private Long id;

    @Schema(description = "상품 ID", example = "10")
    private Long productId;

    @Schema(description = "상품명", example = "맥북 프로 팝니다")
    private String productTitle;

    @Schema(description = "거래 금액", example = "1500000")
    private Long amount;

    @Schema(description = "결제 수단", example = "TRANSFER")
    private String paymentMethod;

    @Schema(description = "거래 상태", example = "COMPLETED")
    private String status;

    @Schema(description = "거래 일시")
    private LocalDateTime createdAt;

    public static TransactionResponseDto from(Transaction entity) {
        return TransactionResponseDto.builder()
                .id(entity.getId())
                .productId(entity.getProduct().getId())
                .productTitle(entity.getProduct().getTitle())
                .amount(entity.getAmount())
                .paymentMethod(entity.getPaymentMethod())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
