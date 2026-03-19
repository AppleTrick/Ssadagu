package com.twotwo.ssadagu.domain.user.service;

import com.twotwo.ssadagu.domain.auth.dto.TokenDto;
import com.twotwo.ssadagu.domain.product.dto.ProductResponseDto;
import com.twotwo.ssadagu.domain.product.dto.ProductWishResponseDto;
import com.twotwo.ssadagu.domain.product.repository.ProductRepository;
import com.twotwo.ssadagu.domain.product.repository.ProductWishRepository;
import com.twotwo.ssadagu.domain.transaction.dto.TransactionResponseDto;
import com.twotwo.ssadagu.domain.transaction.repository.TransactionRepository;
import com.twotwo.ssadagu.domain.user.dto.*;
import com.twotwo.ssadagu.domain.demanddeposit.service.DemandDepositService;
import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.domain.user.repository.UserRepository;
import com.twotwo.ssadagu.global.dto.SsafyApiResponse;
import com.twotwo.ssadagu.global.error.BusinessException;
import com.twotwo.ssadagu.global.error.ErrorCode;
import com.twotwo.ssadagu.global.security.CustomUserDetails;
import com.twotwo.ssadagu.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserKeyService userKeyService;
    private final ProductRepository productRepository;
    private final ProductWishRepository productWishRepository;
    private final TransactionRepository transactionRepository;
    private final DemandDepositService demandDepositService; // 수시입출금 계좌 서비스 주입
    private final com.twotwo.ssadagu.global.service.S3Service s3Service;

    @Transactional
    public UserResponseDto signup(SignUpRequestDto requestDto) {
        if (userRepository.existsByEmail(requestDto.getEmail())) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (userRepository.existsByNickname(requestDto.getNickname())) {
            throw new BusinessException(ErrorCode.NICKNAME_ALREADY_EXISTS);
        }

        // 금융망 MEMBER_01 연동하여 userKey 발급
        String issuedUserKey = userKeyService.createUserKey(requestDto.getEmail());

        // 즉시 금융망 수시입출금 계좌 생성 (DEMAND_DEPOSIT_03)
        // 유효한 수시입출금 상품 고유번호 (SSAFY DEMAND_DEPOSIT_01 조회 결과)
        String defaultAccountTypeUniqueNo = "001-1-7a336b19062347"; 
        try {
            SsafyApiResponse<java.util.Map<String, Object>> accountResponse = demandDepositService.createAccount(defaultAccountTypeUniqueNo, issuedUserKey);
            
            if (accountResponse != null && accountResponse.getRec() != null) {
                java.util.Map<String, Object> rec = accountResponse.getRec();
                if (rec.containsKey("accountNo")) {
                    String accountNo = (String) rec.get("accountNo");
                    log.info("[Signup] 성공적으로 계좌가 생성되었습니다. User Email: {}, AccountNo: {}", requestDto.getEmail(), accountNo);
                }
            } else {
                log.warn("[Signup] 계좌 생성 응답 형식이 예상과 다릅니다. Response: {}", accountResponse);
            }
        } catch (Exception e) {
            log.error("[Signup] 회원가입 중 계좌 자동 생성 실패 (에러무시): {}", e.getMessage());
        }

        User user = User.builder()
                .email(requestDto.getEmail())
                .passwordHash(passwordEncoder.encode(requestDto.getPassword()))
                .nickname(requestDto.getNickname())
                .region("")
                .status("UNVERIFIED")
                .userKey(issuedUserKey)
                .build();

        User savedUser = userRepository.save(user);

        // 자동 로그인: 토큰 생성
        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        TokenDto tokenDto = jwtTokenProvider.generateToken(authentication);

        return UserResponseDto.from(savedUser, tokenDto);
    }

    @Transactional
    public void verifyRegion(Long userId, com.twotwo.ssadagu.domain.user.dto.RegionVerifyRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (!"VERIFIED".equals(user.getStatus())) {
            throw new IllegalArgumentException("계좌 인증이 먼저 완료되어야 동네 인증이 가능합니다.");
        }

        user.updateRegion(requestDto.getRegion()); // 더티 체킹으로 자동 UPDATE
        user.verifyAccount(); // status → ACTIVE
    }

    @Transactional
    public void updateRegion(Long userId, com.twotwo.ssadagu.domain.user.dto.RegionVerifyRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        user.updateRegion(requestDto.getRegion()); // 더티 체킹으로 자동 UPDATE
    }

    // ===== 마이페이지 =====

    @Transactional(readOnly = true)
    public MyPageResponseDto getMyPage(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return MyPageResponseDto.from(user);
    }

    @Transactional
    public MyPageResponseDto updateProfile(Long userId, ProfileUpdateRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (userRepository.existsByNickname(requestDto.getNickname())) {
            throw new BusinessException(ErrorCode.NICKNAME_ALREADY_EXISTS);
        }

        user.updateNickname(requestDto.getNickname());
        return MyPageResponseDto.from(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if ("DELETED".equals(user.getStatus())) {
            throw new BusinessException(ErrorCode.USER_ALREADY_DELETED);
        }

        user.markAsDeleted();
    }

    @Transactional
    public MyPageResponseDto uploadProfileImage(Long userId, org.springframework.web.multipart.MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (user.getProfileImageUrl() != null) {
            try {
                s3Service.deleteImage(user.getProfileImageUrl());
            } catch (Exception e) {
                log.warn("기존 프로필 이미지 삭제 실패: {}", e.getMessage());
            }
        }

        String imageUrl = s3Service.uploadImage(file);
        user.updateProfileImage(imageUrl);
        return MyPageResponseDto.from(user);
    }

    @Transactional
    public MyPageResponseDto deleteProfileImage(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (user.getProfileImageUrl() != null) {
            try {
                s3Service.deleteImage(user.getProfileImageUrl());
            } catch (Exception e) {
                log.warn("기존 프로필 이미지 삭제 실패: {}", e.getMessage());
            }
            user.deleteProfileImage();
        }
        return MyPageResponseDto.from(user);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getMyProducts(Long userId) {
        return productRepository.findBySellerIdAndStatusNot(userId, "DELETED")
                .stream()
                .filter(p -> p.getDeletedAt() == null)
                .map(ProductResponseDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDto> getMyPurchases(Long userId) {
        return transactionRepository.findByBuyerId(userId, org.springframework.data.domain.PageRequest.of(0, 100))
                .getContent() // List로 변환
                .stream()
                .map(t -> TransactionResponseDto.from(t, userId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductWishResponseDto> getMyWishes(Long userId) {
        return productWishRepository.findByUserIdAndDeletedAtIsNull(userId)
                .stream()
                .map(ProductWishResponseDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateSecondaryPassword(Long userId, SecondaryPasswordRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        user.updateSecondaryPassword(passwordEncoder.encode(requestDto.getSecondaryPassword()));
    }

    @Transactional(readOnly = true)
    public void verifySecondaryPassword(Long userId, SecondaryPasswordRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (user.getSecondaryPasswordHash() == null) {
            throw new BusinessException(ErrorCode.SECONDARY_PASSWORD_NOT_SET);
        }

        if (!passwordEncoder.matches(requestDto.getSecondaryPassword(), user.getSecondaryPasswordHash())) {
            throw new BusinessException(ErrorCode.SECONDARY_PASSWORD_NOT_MATCH);
        }
    }

    @Transactional
    public void registerBiometric(Long userId, BiometricRegistrationRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        user.registerBiometric(requestDto.getPublicKey());
    }

    @Transactional
    public void toggleBiometric(Long userId, BiometricToggleRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        user.updateBiometricEnabled(requestDto.getEnabled());
    }
}
