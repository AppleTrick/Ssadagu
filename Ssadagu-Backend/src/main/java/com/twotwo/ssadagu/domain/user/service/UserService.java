package com.twotwo.ssadagu.domain.user.service;

import com.twotwo.ssadagu.domain.auth.dto.TokenDto;
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

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public UserResponseDto signup(SignUpRequestDto requestDto) {
        if (userRepository.existsByEmail(requestDto.getEmail())) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (userRepository.existsByNickname(requestDto.getNickname())) {
            throw new BusinessException(ErrorCode.NICKNAME_ALREADY_EXISTS);
        }

        User user = User.builder()
                .email(requestDto.getEmail())
                .passwordHash(passwordEncoder.encode(requestDto.getPassword()))
                .nickname(requestDto.getNickname())
                .status("UNVERIFIED")
                .build();

        User savedUser = userRepository.save(user);

        // 자동 로그인: 토큰 생성
        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        TokenDto tokenDto = jwtTokenProvider.generateToken(authentication);

        return UserResponseDto.from(savedUser, tokenDto);
    }
}
