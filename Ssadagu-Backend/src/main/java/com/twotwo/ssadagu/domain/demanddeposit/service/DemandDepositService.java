package com.twotwo.ssadagu.domain.demanddeposit.service;

import com.twotwo.ssadagu.domain.demanddeposit.dto.DemandDepositAccountCreateRequestDto;
import com.twotwo.ssadagu.global.util.SsafyHeaderUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DemandDepositService {

    private final SsafyHeaderUtil ssafyHeaderUtil;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ssafy.api.base-url}")
    private String baseUrl;

    @Value("${ssafy.api.user-key}")
    private String defaultUserKey;

    /**
     * SSAFY 금융망: 수시입출금 계좌 생성 (DEMAND_DEPOSIT_03)
     */
    public Map<String, Object> createAccount(DemandDepositAccountCreateRequestDto requestDto) {
        String url = baseUrl + "/edu/demandDeposit/createDemandDepositAccount";
        // UserKey가 명시되지 않은 경우, application.properties에서 주입된 기본 UserKey를 사용
        String userKey = (requestDto.getTestUserKey() != null && !requestDto.getTestUserKey().isEmpty())
                ? requestDto.getTestUserKey() : defaultUserKey;

        // 공통 Header 데이터 생성
        Map<String, String> header = ssafyHeaderUtil.createHeader("createDemandDepositAccount", userKey);

        // Payload 구성
        Map<String, Object> payload = new HashMap<>();
        payload.put("Header", header);
        payload.put("accountTypeUniqueNo", requestDto.getAccountTypeUniqueNo());

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, httpHeaders);

        log.info("[Demand Deposit] 계좌 생성 요청 - accountTypeUniqueNo: {}", requestDto.getAccountTypeUniqueNo());
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
        return response.getBody();
    }

    /**
     * SSAFY 금융망: 수시입출금 계좌 조회 (단건) (DEMAND_DEPOSIT_05)
     */
    public Map<String, Object> getAccount(String accountNo, String testUserKey) {
        String url = baseUrl + "/edu/demandDeposit/inquireDemandDepositAccount";
        String userKey = (testUserKey != null && !testUserKey.isEmpty()) ? testUserKey : defaultUserKey;

        Map<String, String> header = ssafyHeaderUtil.createHeader("inquireDemandDepositAccount", userKey);

        Map<String, Object> payload = new HashMap<>();
        payload.put("Header", header);
        payload.put("accountNo", accountNo);

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, httpHeaders);

        log.info("[Demand Deposit] 계좌 단건 조회 요청 - accountNo: {}", accountNo);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
        return response.getBody();
    }

    /**
     * SSAFY 금융망: 수시입출금 계좌 거래내역조회 (DEMAND_DEPOSIT_12)
     */
    public Map<String, Object> getTransactionHistory(String accountNo, String startDate, String endDate, String transactionType, String orderByType, String testUserKey) {
        String url = baseUrl + "/edu/demandDeposit/inquireTransactionHistoryList";
        String userKey = (testUserKey != null && !testUserKey.isEmpty()) ? testUserKey : defaultUserKey;

        Map<String, String> header = ssafyHeaderUtil.createHeader("inquireTransactionHistoryList", userKey);

        Map<String, Object> payload = new HashMap<>();
        payload.put("Header", header);
        payload.put("accountNo", accountNo);
        payload.put("startDate", startDate != null ? startDate : "20240101"); // 기본값 설정
        payload.put("endDate", endDate != null ? endDate : "20261231");
        payload.put("transactionType", transactionType != null ? transactionType : "A"); // A: 전체, M: 입금, D: 출금
        payload.put("orderByType", orderByType != null ? orderByType : "DESC"); // DESC: 최신순

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, httpHeaders);

        log.info("[Demand Deposit] 계좌 거래내역 조회 요청 - accountNo: {}", accountNo);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
        return response.getBody();
    }
}
