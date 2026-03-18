package com.twotwo.ssadagu.domain.user.service;

import com.twotwo.ssadagu.domain.auth.dto.TokenDto;
import com.twotwo.ssadagu.domain.product.dto.ProductResponseDto;
import com.twotwo.ssadagu.domain.product.dto.ProductWishResponseDto;
import com.twotwo.ssadagu.domain.product.repository.ProductRepository;
import com.twotwo.ssadagu.domain.product.repository.ProductWishRepository;
import com.twotwo.ssadagu.domain.transaction.dto.TransactionResponseDto;
import com.twotwo.ssadagu.domain.transaction.repository.TransactionRepository;
import com.twotwo.ssadagu.domain.user.dto.MyPageResponseDto;
import com.twotwo.ssadagu.domain.user.dto.ProfileUpdateRequestDto;
import com.twotwo.ssadagu.domain.user.dto.SignUpRequestDto;
import com.twotwo.ssadagu.domain.user.dto.UserResponseDto;
import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.domain.user.repository.UserRepository;
import com.twotwo.ssadagu.global.error.BusinessException;
import com.twotwo.ssadagu.global.error.ErrorCode;
import com.twotwo.ssadagu.global.security.CustomUserDetails;
import com.twotwo.ssadagu.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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

        if (!"ACCOUNT_VERIFIED".equals(user.getStatus())) {
            throw new IllegalArgumentException("계좌 인증이 먼저 완료되어야 동네 인증이 가능합니다.");
        }

        user.updateRegion(requestDto.getRegion()); // 더티 체킹으로 자동 UPDATE
        user.verifyAccount();                       // status → ACTIVE
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
        return transactionRepository.findByBuyerId(userId)
                .stream()
                .map(TransactionResponseDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductWishResponseDto> getMyWishes(Long userId) {
        return productWishRepository.findByUserIdAndDeletedAtIsNull(userId)
                .stream()
                .map(ProductWishResponseDto::from)
                .collect(Collectors.toList());
    }
}
