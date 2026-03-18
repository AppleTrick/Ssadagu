package com.twotwo.ssadagu.domain.transaction.dto;

import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class TransactionRequestDto {
    private Long productId;
    private Long buyerId;
    private Long amount;
}
