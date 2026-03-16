package com.twotwo.ssadagu;

import com.twotwo.ssadagu.domain.product.entity.Product;
import com.twotwo.ssadagu.domain.product.entity.ProductImage;
import com.twotwo.ssadagu.domain.product.repository.ProductRepository;
import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.domain.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootTest
public class DataInsertTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @Transactional
    @Rollback(false)
    public void insertTestData() {
        for (int i = 1; i <= 10; i++) {
            String email = "test" + i + "@example.com";
            String nickname = "테스트유저" + i;

            if (!userRepository.existsByEmail(email)) {
                User user = User.builder()
                        .email(email)
                        .passwordHash(passwordEncoder.encode("password123"))
                        .nickname(nickname)
                        .status("ACTIVE")
                        .build();
                userRepository.save(user);
                System.out.println("유저 생성 완료: " + email);
            } else {
                System.out.println("이미 존재함: " + email);
            }
        }
    }

    @Test
    @Transactional
    @Rollback(false)
    public void insertProductDummyData() {
        // 판매자로 사용할 유저 목록 조회
        List<User> sellers = userRepository.findAll();
        if (sellers.isEmpty()) {
            System.out.println("유저가 없습니다. insertTestData()를 먼저 실행하세요.");
            return;
        }

        String[][] products = {
            // { title, description, price, category, region, status }
            {"맥북 프로 M3 팝니다",      "2024년형 맥북 프로 14인치, 거의 새것",   "2800000", "ELECTRONICS", "강남구",  "ON_SALE"},
            {"아이폰 15 Pro 판매",        "128GB 블랙 색상, 케이스 포함",           "1100000", "ELECTRONICS", "서초구",  "ON_SALE"},
            {"나이키 에어맥스 270",        "275 사이즈, 2회 착용",                   "85000",   "FASHION",     "마포구",  "ON_SALE"},
            {"무인양품 소파",             "2인용 패브릭 소파, 직거래만",            "320000",  "FURNITURE",   "용산구",  "ON_SALE"},
            {"레고 테크닉 42154",         "미개봉 새상품",                           "79000",   "HOBBY",       "강남구",  "ON_SALE"},
            {"삼성 갤럭시 S24",           "256GB 크림 색상, 충전기 포함",           "750000",  "ELECTRONICS", "송파구",  "ON_SALE"},
            {"다이슨 에어랩",             "2023년 구매, 전 기능 정상 작동",         "480000",  "BEAUTY",      "강남구",  "ON_SALE"},
            {"뉴발란스 990v5",            "270 사이즈, 박스 있음",                   "130000",  "FASHION",     "서초구",  "ON_SALE"},
            {"아이패드 Pro 11 4세대",     "256GB WiFi, 펜슬 1세대 포함",           "950000",  "ELECTRONICS", "마포구",  "ON_SALE"},
            {"쿠쿠 전기밥솥",             "6인용, 5년 사용, 기능 정상",              "45000",   "KITCHEN",     "강동구",  "ON_SALE"},
            {"캐논 EOS R10 카메라",       "바디만 판매, 셔터 수 3000회",            "680000",  "HOBBY",       "강남구",  "ON_SALE"},
            {"에르메스 가죽 벨트",        "정품, 사이즈 80, 케이스 포함",           "280000",  "FASHION",     "강남구",  "ON_SALE"},
            {"닌텐도 스위치 OLED",        "게임 3개 포함, 정상 작동",               "260000",  "HOBBY",       "송파구",  "ON_SALE"},
            {"애플 에어팟 프로 2세대",    "USB-C 버전, 케이스 포함",                "220000",  "ELECTRONICS", "용산구",  "ON_SALE"},
            {"LG 스탠바이미 27인치",      "2022년 구매, 리모컨 포함",               "420000",  "ELECTRONICS", "마포구",  "ON_SALE"},
            {"버버리 트렌치 코트",        "M 사이즈, 드라이클리닝 완료",            "350000",  "FASHION",     "강남구",  "ON_SALE"},
            {"샤오미 로봇 청소기",        "S10+ 모델, 1년 사용, 정상 작동",        "280000",  "APPLIANCE",   "은평구",  "ON_SALE"},
            {"북미판 PS5 디스크 에디션",  "컨트롤러 2개 포함",                      "550000",  "HOBBY",       "강서구",  "ON_SALE"},
            {"아침묵상 성경 주석 세트",   "20권 완질, 깨끗한 상태",                 "120000",  "BOOKS",       "노원구",  "ON_SALE"},
            {"원목 책상 1200mm",          "서랍 2개 포함, 직접 수령만",             "150000",  "FURNITURE",   "강남구",  "ON_SALE"},
            {"고프로 히어로 12",          "기본 악세서리 포함",                      "380000",  "HOBBY",       "서초구",  "ON_SALE"},
            {"조이로 스탠딩 책상",        "전동 높이조절, 블랙 색상",               "290000",  "FURNITURE",   "마포구",  "RESERVED"},
            {"애플워치 울트라 2",         "49mm 티타늄, 밴드 3개",                  "820000",  "ELECTRONICS", "강남구",  "RESERVED"},
            {"겐조 맨투맨 M",             "오버핏 스타일, 세탁 1회",                "95000",   "FASHION",     "송파구",  "ON_SALE"},
            {"투명 서울 지하철 터치케이스","갤럭시 S24+ 전용, 새상품",              "12000",   "ACCESSORIES", "광진구",  "ON_SALE"},
            {"한울 디퓨저 세트",          "200ml 3개, 미개봉",                       "28000",   "INTERIOR",    "서초구",  "ON_SALE"},
            {"요가매트 6mm TPE",          "미사용, 포장 상태 그대로",               "18000",   "SPORTS",      "강북구",  "ON_SALE"},
            {"이케아 칼락스 4x4",         "조립 상태 판매, 직접 수령",              "65000",   "FURNITURE",   "마포구",  "ON_SALE"},
            {"모니터암 에르고트론",        "LX 모델, 거의 새것",                      "110000",  "ELECTRONICS", "금천구",  "ON_SALE"},
            {"로지텍 MX Keys 키보드",     "맥/윈도우 멀티페어링, 정상",             "95000",   "ELECTRONICS", "강남구",  "ON_SALE"},
        };

        for (int i = 0; i < products.length; i++) {
            String[] p = products[i];
            User seller = sellers.get(i % sellers.size());

            Product product = Product.builder()
                    .seller(seller)
                    .title(p[0])
                    .description(p[1])
                    .price(Long.parseLong(p[2]))
                    .categoryCode(p[3])
                    .regionName(p[4])
                    .status(p[5])
                    .wishCount(0)
                    .chatCount(0)
                    .build();

            // 썸네일 이미지 (picsum.photos 랜덤 이미지)
            ProductImage image = ProductImage.builder()
                    .product(product)
                    .imageUrl("https://picsum.photos/seed/" + (i + 1) + "/400/400")
                    .sortOrder(0)
                    .build();
            product.getImages().add(image);

            productRepository.save(product);
            System.out.println("상품 생성 완료: [" + p[4] + "] " + p[0]);
        }

        System.out.println("총 " + products.length + "개 상품 더미 데이터 삽입 완료!");
    }
}
