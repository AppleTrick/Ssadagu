package com.twotwo.ssadagu.domain.transaction.dto;

import com.twotwo.ssadagu.domain.transaction.entity.Transaction;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TransactionResponseDto {
    private Long id;

    public static TransactionResponseDto from(Transaction entity) {
        return TransactionResponseDto.builder()
                .id(entity.getId())
                .build();
    }
}
