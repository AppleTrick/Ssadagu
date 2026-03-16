package com.twotwo.ssadagu;

import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.domain.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
public class DataInsertTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @Transactional
    @Rollback(false) // 실제 DB에 반영하기 위해 false 설정
    public void insertTestData() {
        for (int i = 1; i <= 10; i++) {
            String email = "test" + i + "@example.com";
            String nickname = "테스트유저" + i;
            
            // 중복 확인 후 없으면 생성
            if (!userRepository.existsByEmail(email)) {
                User user = User.builder()
                        .email(email)
                        .passwordHash(passwordEncoder.encode("password123"))
                        .nickname(nickname)
                        .status("ACTIVE")
                        .build();
                
                userRepository.save(user);
                System.out.println("생성 완료: " + email);
            } else {
                System.out.println("이미 존재함: " + email);
            }
        }
    }
}
