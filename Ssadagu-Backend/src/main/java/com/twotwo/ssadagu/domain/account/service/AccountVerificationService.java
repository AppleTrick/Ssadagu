package com.twotwo.ssadagu.domain.account.service;

import com.twotwo.ssadagu.domain.account.repository.AccountVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccountVerificationService {

    private final AccountVerificationRepository accountVerificationRepository;

}
