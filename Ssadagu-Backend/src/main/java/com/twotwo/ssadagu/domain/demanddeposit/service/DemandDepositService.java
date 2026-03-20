package com.twotwo.ssadagu.domain.demanddeposit.service;

import com.twotwo.ssadagu.global.dto.SsafyApiResponse;
import com.twotwo.ssadagu.global.util.SsafyHeaderUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientResponseException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DemandDepositService {

    private final SsafyHeaderUtil ssafyHeaderUtil;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    @Value("${ssafy.api.base-url}")
    private String baseUrl;

    @Value("${ssafy.api.user-key}")
    private String defaultUserKey;

    /**
     * SSAFY 금융망: 수시입출금 계좌 생성 (DEMAND_DEPOSIT_03)
     */
    public SsafyApiResponse<Map<String, Object>> createAccount(String accountTypeUniqueNo, String userKey) {
        String url = baseUrl + "/edu/demandDeposit/createDemandDepositAccount";
        
        if (userKey == null || userKey.isEmpty()) {
            userKey = defaultUserKey;
        }

        // 공통 Header 데이터 생성
        Map<String, String> header = ssafyHeaderUtil.createHeader("createDemandDepositAccount", userKey);

        // Payload 구성
        Map<String, Object> payload = new HashMap<>();
        payload.put("Header", header);
        payload.put("accountTypeUniqueNo", accountTypeUniqueNo);

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, httpHeaders);

        log.info("[Demand Deposit] 계좌 생성 요청 - accountTypeUniqueNo: {}", accountTypeUniqueNo);
        try {
            ResponseEntity<SsafyApiResponse<Map<String, Object>>> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, new ParameterizedTypeReference<SsafyApiResponse<Map<String, Object>>>() {});
            return response.getBody();
        } catch (RestClientResponseException e) {
            log.error("[Demand Deposit] 계좌 생성 오류: {}", e.getResponseBodyAsString());
            try {
                // 에러 응답은 { "responseCode": "...", "responseMessage": "..." } 처럼 Flat하게 올 수 있음
                Map<String, String> errorMap = objectMapper.readValue(e.getResponseBodyAsString(), new TypeReference<Map<String, String>>() {});
                SsafyApiResponse.SsafyHeader errorHeader = SsafyApiResponse.SsafyHeader.builder()
                        .responseCode(errorMap.getOrDefault("responseCode", "500"))
                        .responseMessage(errorMap.getOrDefault("responseMessage", "SSAFY API 에러"))
                        .build();
                return SsafyApiResponse.<Map<String, Object>>builder()
                        .header(errorHeader)
                        .build();
            } catch (Exception ex) {
                throw new RuntimeException("API 응답 파싱 실패", ex);
            }
        }
    }

    /**
     * SSAFY 금융망: 수시입출금 계좌 조회 (단건) (DEMAND_DEPOSIT_05)
     */
    public SsafyApiResponse<Map<String, Object>> getAccount(String accountNo, String userKey) {
        String url = baseUrl + "/edu/demandDeposit/inquireDemandDepositAccount";

        if (userKey == null || userKey.isEmpty()) {
            userKey = defaultUserKey;
        }

        Map<String, String> header = ssafyHeaderUtil.createHeader("inquireDemandDepositAccount", userKey);

        String cleanAccountNo = accountNo != null ? accountNo.replaceAll("[^0-9]", "") : "";

        Map<String, Object> payload = new HashMap<>();
        payload.put("Header", header);
        payload.put("accountNo", cleanAccountNo);

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, httpHeaders);

        log.info("[Demand Deposit] 계좌 단건 조회 요청 - accountNo: {}", cleanAccountNo);
        try {
            ResponseEntity<SsafyApiResponse<Map<String, Object>>> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, new ParameterizedTypeReference<SsafyApiResponse<Map<String, Object>>>() {});
            return response.getBody();
        } catch (RestClientResponseException e) {
            log.error("[Demand Deposit] 계좌 단건 조회 오류: {}", e.getResponseBodyAsString());
            try {
                Map<String, String> errorMap = objectMapper.readValue(e.getResponseBodyAsString(), new TypeReference<Map<String, String>>() {});
                SsafyApiResponse.SsafyHeader errorHeader = SsafyApiResponse.SsafyHeader.builder()
                        .responseCode(errorMap.getOrDefault("responseCode", "500"))
                        .responseMessage(errorMap.getOrDefault("responseMessage", "SSAFY API 에러"))
                        .build();
                return SsafyApiResponse.<Map<String, Object>>builder()
                        .header(errorHeader)
                        .build();
            } catch (Exception ex) {
                throw new RuntimeException("API 응답 파싱 실패", ex);
            }
        }
    }

    /**
     * SSAFY 금융망: 수시입출금 계좌 거래내역조회 (DEMAND_DEPOSIT_12)
     */
    public SsafyApiResponse<Map<String, Object>> getTransactionHistory(String accountNo, String startDate, String endDate, String transactionType, String orderByType, String userKey) {
        String url = baseUrl + "/edu/demandDeposit/inquireTransactionHistoryList";

        if (userKey == null || userKey.isEmpty()) {
            userKey = defaultUserKey;
        }

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
        ResponseEntity<SsafyApiResponse<Map<String, Object>>> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, new ParameterizedTypeReference<SsafyApiResponse<Map<String, Object>>>() {});
        return response.getBody();
    }

    /**
     * SSAFY 금융망: 수시입출금 계좌 이체 (DEMAND_DEPOSIT_02)
     */
    public SsafyApiResponse<List<Map<String, Object>>> updateTransfer(String depositAccountNo, String depositTransactionMemo, 
                                                               String withdrawalAccountNo, String withdrawalTransactionMemo, 
                                                               Long transactionBalance, String userKey) {
        String url = baseUrl + "/edu/demandDeposit/updateDemandDepositAccountTransfer";

        if (userKey == null || userKey.isEmpty()) {
            userKey = defaultUserKey;
        }

        Map<String, String> header = ssafyHeaderUtil.createHeader("updateDemandDepositAccountTransfer", userKey);

        Map<String, Object> payload = new HashMap<>();
        payload.put("Header", header);
        payload.put("depositAccountNo", depositAccountNo);
        payload.put("depositTransactionMemo", depositTransactionMemo);
        payload.put("withdrawalAccountNo", withdrawalAccountNo);
        payload.put("withdrawalTransactionMemo", withdrawalTransactionMemo);
        payload.put("transactionBalance", String.valueOf(transactionBalance));

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, httpHeaders);

        log.info("[Demand Deposit] 계좌 이체 요청 - From: {}, To: {}, Amount: {}", withdrawalAccountNo, depositAccountNo, transactionBalance);
        ResponseEntity<SsafyApiResponse<List<Map<String, Object>>>> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, new ParameterizedTypeReference<SsafyApiResponse<List<Map<String, Object>>>>() {});
        return response.getBody();
    }

    /**
     * SSAFY 금융망: 수시입출금 계좌 입금 (테스트용) (DEMAND_DEPOSIT_09)
     */
    public SsafyApiResponse<Map<String, Object>> updateDeposit(String accountNo, Long transactionBalance, String transactionSummary, String userKey) {
        String url = baseUrl + "/edu/demandDeposit/updateDemandDepositAccountDeposit";

        if (userKey == null || userKey.isEmpty()) {
            userKey = defaultUserKey;
        }

        Map<String, String> header = ssafyHeaderUtil.createHeader("updateDemandDepositAccountDeposit", userKey);

        Map<String, Object> payload = new HashMap<>();
        payload.put("Header", header);
        payload.put("accountNo", accountNo);
        payload.put("transactionBalance", String.valueOf(transactionBalance));
        payload.put("transactionSummary", transactionSummary != null ? transactionSummary : "테스트 입금");

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, httpHeaders);

        log.info("[Demand Deposit] 계좌 입금 요청 - To: {}, Amount: {}", accountNo, transactionBalance);
        ResponseEntity<SsafyApiResponse<Map<String, Object>>> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, new ParameterizedTypeReference<SsafyApiResponse<Map<String, Object>>>() {});
        return response.getBody();
    }
}
