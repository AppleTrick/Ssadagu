package com.twotwo.ssadagu.global.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.global.response.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class VerificationFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    // 1원 인증 없이도 접근 가능한 경로 목록
    private final List<String> whitelist = Arrays.asList(
            "/api/v1/auth/**",
            "/api/v1/users/signup",
            "/api/v1/users/*/region-verify",
            "/api/v1/accounts/**",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/error",
            "/api/v1/chat/test/**");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();

        // 화이트리스트 경로는 검증 통과
        if (whitelist.stream().anyMatch(pattern -> pathMatcher.match(pattern, requestURI))) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.getUser();

            // 유저 상태가 ACTIVE가 아니면(예: UNVERIFIED) 차단
            if (!"ACTIVE".equals(user.getStatus())) {
                response.setStatus(HttpStatus.FORBIDDEN.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");

                ApiResponse<Void> apiResponse = ApiResponse.error("1원 계좌 인증이 필요합니다.");
                response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
