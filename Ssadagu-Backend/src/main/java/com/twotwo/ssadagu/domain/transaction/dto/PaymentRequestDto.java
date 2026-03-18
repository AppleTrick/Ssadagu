package com.twotwo.ssadagu.domain.transaction.dto;

import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PaymentRequestDto {
    private Long productId;
    private Long buyerId;
    private Long roomId;
}
