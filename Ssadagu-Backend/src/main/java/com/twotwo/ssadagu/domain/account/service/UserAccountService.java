package com.twotwo.ssadagu.domain.account.service;

import com.twotwo.ssadagu.domain.account.dto.AccountRegisterRequestDto;
import com.twotwo.ssadagu.domain.account.dto.AccountRegisterResponseDto;
import com.twotwo.ssadagu.domain.account.dto.AccountVerifyRequestDto;
import com.twotwo.ssadagu.domain.account.dto.UserAccountResponseDto;
import com.twotwo.ssadagu.domain.account.entity.AccountVerification;
import com.twotwo.ssadagu.domain.account.entity.UserAccount;
import com.twotwo.ssadagu.domain.account.repository.AccountVerificationRepository;
import com.twotwo.ssadagu.domain.account.repository.UserAccountRepository;
import com.twotwo.ssadagu.domain.demanddeposit.service.DemandDepositService;
import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserAccountService {

    private final UserAccountRepository userAccountRepository;
    private final AccountVerificationRepository verificationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DemandDepositService demandDepositService;

    @Transactional
    public AccountRegisterResponseDto registerAccountAndStartAuth(User user, AccountRegisterRequestDto requestDto) {
        UserAccount account = userAccountRepository.findByUserId(user.getId())
                .orElse(null);

        String newHash = passwordEncoder.encode(requestDto.getAccountNumber()); // 간이 해시

        if (account == null) {
            account = UserAccount.builder()
                    .user(user)
                    .bankCode(requestDto.getBankCode())
                    .bankName(requestDto.getBankName() != null ? requestDto.getBankName() : "등록은행")
                    .accountNumber(requestDto.getAccountNumber())
                    .accountHash(newHash)
                    .accountHolderName(requestDto.getAccountHolderName())
                    .isPrimary(true)
                    .verifiedStatus("PENDING")
                    .build();
            account = userAccountRepository.save(account);
        } else {
            // 이미 PENDING이거나 VERIFIED 이더라도 사용자가 재인증을 요청했으므로 덮어쓰고 PENDING으로 초기화
            account.updateAccountAndPending(
                    requestDto.getBankCode(),
                    requestDto.getBankName() != null ? requestDto.getBankName() : "등록은행",
                    requestDto.getAccountNumber(),
                    newHash,
                    requestDto.getAccountHolderName()
            );
        }

        // 실제 4자리 랜덤 숫자 통장 적요(Summary)로 송금
        String randomCode = String.format("%04d", new Random().nextInt(10000));
        String summary = "SSADAGU" + randomCode;

        try {
            log.info("[1원 송금 요청] 계좌번호: {}, 입금자명: {}", requestDto.getAccountNumber(), summary);
            demandDepositService.updateDeposit(requestDto.getAccountNumber(), 1L, summary, user.getUserKey());
            log.info("[1원 송금 완료] 계좌번호: {}, 인증코드: {}", requestDto.getAccountNumber(), randomCode);
        } catch (Exception e) {
            log.error("[1원 송금 오류] 1원 이체 실패: {}", e.getMessage());
            throw new IllegalArgumentException("금융망 연동 오류: 유효한 계좌번호인지 확인해주세요.", e);
        }

        // AccountVerification 생성
        AccountVerification verification = AccountVerification.builder()
                .account(account)
                .user(user)
                .sentAmount(1)
                .verifyCodeHash(passwordEncoder.encode(randomCode))
                .status("PENDING")
                .expiresAt(LocalDateTime.now().plusMinutes(5)) // 5분 만료
                .requestedAt(LocalDateTime.now())
                .build();

        verificationRepository.save(verification);

        return AccountRegisterResponseDto.builder()
                .id(account.getId())
                .build();
    }

    @Transactional
    public void verifyAuth(User user, Long accountId, AccountVerifyRequestDto requestDto) {
        AccountVerification verification = verificationRepository
                .findTopByAccountIdAndStatusOrderByRequestedAtDesc(accountId, "PENDING")
                .orElseThrow(() -> new IllegalArgumentException("유효한 인증 요청 내역이 없습니다."));

        if (!verification.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("본인의 인증 요청만 확인할 수 있습니다.");
        }

        if (!"PENDING".equals(verification.getStatus())) {
            throw new IllegalArgumentException("이미 처리된 인증 요청입니다.");
        }

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("인증 시간이 만료되었습니다.");
        }

        if (!passwordEncoder.matches(requestDto.getCode(), verification.getVerifyCodeHash())) {
            throw new IllegalArgumentException("인증 번호가 일치하지 않습니다.");
        }

        // 1. 인증 기록 및 계좌 상태 업데이트
        LocalDateTime now = LocalDateTime.now();
        verification.verify(now);
        verification.getAccount().verify();
        
        // 2. 중요: 로그인에 쓰이는 고유값인 '이메일'을 기반으로 DB 상태를 강제 업데이트 (가장 확실한 방법)
        userRepository.updateStatusToVerifiedByEmail(user.getEmail());
    }

    @Transactional(readOnly = true)
    public UserAccountResponseDto getMyAccount(Long userId) {
        UserAccount account = userAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.ACCOUNT_NOT_FOUND));
        return UserAccountResponseDto.from(account);
    }
}
