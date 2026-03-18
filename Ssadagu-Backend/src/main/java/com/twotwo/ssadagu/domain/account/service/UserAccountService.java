package com.twotwo.ssadagu.domain.account.service;

import com.twotwo.ssadagu.domain.account.dto.AccountRegisterRequestDto;
import com.twotwo.ssadagu.domain.account.dto.AccountRegisterResponseDto;
import com.twotwo.ssadagu.domain.account.dto.AccountVerifyRequestDto;
import com.twotwo.ssadagu.domain.account.entity.AccountVerification;
import com.twotwo.ssadagu.domain.account.entity.UserAccount;
import com.twotwo.ssadagu.domain.account.repository.AccountVerificationRepository;
import com.twotwo.ssadagu.domain.account.repository.UserAccountRepository;
import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.global.util.SsafyHeaderUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserAccountService {

    private final UserAccountRepository userAccountRepository;
    private final AccountVerificationRepository verificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final SsafyHeaderUtil ssafyHeaderUtil;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ssafy.api.base-url}")
    private String baseUrl;

    private static final String AUTH_TEXT = "SSADAGU";

    @Transactional
    public AccountRegisterResponseDto registerAccountAndStartAuth(User user, AccountRegisterRequestDto requestDto) {
        // 이미 계좌가 있는지 확인. 없다면 PENDING 상태로 생성
        UserAccount account = userAccountRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserAccount newAccount = UserAccount.builder()
                            .user(user)
                            .bankCode(requestDto.getBankCode())
                            .bankName("임시은행명") // 프론트에서 넘어오지 않으므로 임시 설정
                            .accountNumber(requestDto.getAccountNumber())
                            .accountHash(passwordEncoder.encode(requestDto.getAccountNumber())) // 간이 해시
                            .accountHolderName(requestDto.getAccountHolderName())
                            .isPrimary(true)
                            .verifiedStatus("PENDING")
                            .build();
                    return userAccountRepository.save(newAccount);
                });

        if ("VERIFIED".equals(account.getVerifiedStatus())) {
            throw new IllegalArgumentException("이미 인증된 계좌입니다.");
        }

        // Real API: 1원 송금 요청 (openAccountAuth)
        String url = baseUrl + "/edu/accountAuth/openAccountAuth";
        Map<String, String> ssafyHeader = ssafyHeaderUtil.createHeader("openAccountAuth", user.getUserKey());
        
        Map<String, Object> payload = new HashMap<>();
        payload.put("Header", ssafyHeader);
        payload.put("accountNo", requestDto.getAccountNumber());
        payload.put("authText", AUTH_TEXT);

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, httpHeaders);

        log.info("[1원 송금 요청] 계좌번호: {}, authText: {}", requestDto.getAccountNumber(), AUTH_TEXT);
        try {
            restTemplate.postForEntity(url, entity, Map.class);
        } catch (Exception e) {
            log.error("1원 송금 API 호출 실패: {}", e.getMessage());
            throw new RuntimeException("금융망 API 호출에 실패했습니다.");
        }

        // AccountVerification 생성 (DB 기록용)
        AccountVerification verification = AccountVerification.builder()
                .account(account)
                .user(user)
                .sentAmount(1)
                .verifyCodeHash(AUTH_TEXT) // 실제 연동 시에는 authText를 저장해둠 (또는 그대로 사용)
                .status("PENDING")
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .requestedAt(LocalDateTime.now())
                .build();

        AccountVerification savedVerification = verificationRepository.save(verification);

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

        // Real API: 1원 송금 검증 요청 (checkAuthCode)
        String url = baseUrl + "/edu/accountAuth/checkAuthCode";
        Map<String, String> ssafyHeader = ssafyHeaderUtil.createHeader("checkAuthCode", user.getUserKey());

        Map<String, Object> payload = new HashMap<>();
        payload.put("Header", ssafyHeader);
        payload.put("accountNo", verification.getAccount().getAccountNumber());
        payload.put("authText", verification.getVerifyCodeHash()); // 발송 시 사용했던 AUTH_TEXT
        payload.put("authCode", requestDto.getCode());

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, httpHeaders);

        log.info("[1원 인증 검증] 계좌번호: {}, 입력코드: {}", verification.getAccount().getAccountNumber(), requestDto.getCode());
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            // SSAFY API는 실패 시 에러 응답이나 특정 에러 코드를 줄 수 있음. 
            // 상세한 에러 처리는 API 응답 구조에 따라 보완 필요.
        } catch (Exception e) {
            log.error("1원 인증 검증 API 호출 실패: {}", e.getMessage());
            throw new IllegalArgumentException("인증 번호가 일치하지 않거나 API 호출에 실패했습니다.");
        }

        // 상태 업데이트 (더티 체킹으로 자동 UPDATE)
        LocalDateTime now = LocalDateTime.now();
        verification.verify(now);                // AccountVerification: status=VERIFIED, verifiedAt 설정
        verification.getAccount().verify();      // UserAccount: verifiedStatus=VERIFIED
        user.setAccountVerified();               // User: status=ACCOUNT_VERIFIED
    }
}
