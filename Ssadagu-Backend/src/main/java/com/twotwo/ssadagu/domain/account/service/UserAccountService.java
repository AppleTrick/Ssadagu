package com.twotwo.ssadagu.domain.account.service;

import com.twotwo.ssadagu.domain.account.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserAccountService {

    private final UserAccountRepository userAccountRepository;

}
