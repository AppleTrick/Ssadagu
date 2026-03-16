package com.twotwo.ssadagu.domain.product.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.twotwo.ssadagu.domain.product.dto.ProductCreateRequestDto;
import com.twotwo.ssadagu.domain.product.dto.ProductResponseDto;
import com.twotwo.ssadagu.domain.product.dto.ProductUpdateRequestDto;
import com.twotwo.ssadagu.domain.product.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

        private MockMvc mockMvc;
        private ObjectMapper objectMapper;

        @Mock
        private ProductService productService;

        @Mock
        private com.twotwo.ssadagu.domain.product.service.ProductWishService productWishService;

        @InjectMocks
        private ProductController productController;

        @BeforeEach
        void setUp() {
                mockMvc = MockMvcBuilders.standaloneSetup(productController)
                                .setCustomArgumentResolvers(new org.springframework.web.method.support.HandlerMethodArgumentResolver() {
                                        @Override
                                        public boolean supportsParameter(org.springframework.core.MethodParameter parameter) {
                                                return parameter.hasParameterAnnotation(org.springframework.security.core.annotation.AuthenticationPrincipal.class);
                                        }

                                        @Override
                                        public Object resolveArgument(org.springframework.core.MethodParameter parameter,
                                                                      org.springframework.web.method.support.ModelAndViewContainer mavContainer,
                                                                      org.springframework.web.context.request.NativeWebRequest webRequest,
                                                                      org.springframework.web.bind.support.WebDataBinderFactory binderFactory) {
                                                // 인증이 필요한 테스트를 위해 Mock UserDetails 반환
                                                com.twotwo.ssadagu.domain.user.entity.User user = com.twotwo.ssadagu.domain.user.entity.User.builder().build();
                                                org.springframework.test.util.ReflectionTestUtils.setField(user, "id", 1L);
                                                return new com.twotwo.ssadagu.global.security.CustomUserDetails(user);
                                        }
                                })
                                .build();
                objectMapper = new ObjectMapper();
        }

        @Test
        @DisplayName("상품 생성 API 호출 (POST /api/v1/products)")
        void createProduct() throws Exception {
                // given
                ProductCreateRequestDto request = new ProductCreateRequestDto(
                                1L, "TITLE", "DESC", 1000L, "CAT", "REGION", java.util.List.of("url1"));
                ProductResponseDto response = ProductResponseDto.builder()
                                .id(1L)
                                .title("TITLE")
                                .price(1000L)
                                .status("ON_SALE")
                                .images(java.util.List.of(com.twotwo.ssadagu.domain.product.dto.ProductImageResponseDto.builder().id(1L).imageUrl("url1").build()))
                                .build();

                given(productService.createProduct(any(ProductCreateRequestDto.class))).willReturn(response);

                // when & then
                mockMvc.perform(post("/api/v1/products")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(1L))
                                .andExpect(jsonPath("$.title").value("TITLE"))
                                .andExpect(jsonPath("$.images[0].imageUrl").value("url1"));
        }

        @Test
        @DisplayName("상품 단건 조회 API 호출 (GET /api/v1/products/{id})")
        void getProduct() throws Exception {
                // given
                ProductResponseDto response = ProductResponseDto.builder()
                                .id(1L)
                                .title("GET TITLE")
                                .build();

                given(productService.getProduct(eq(1L), any())).willReturn(response);

                // when & then
                mockMvc.perform(get("/api/v1/products/{id}", 1L))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(1L))
                                .andExpect(jsonPath("$.title").value("GET TITLE"));
        }

        @Test
        @DisplayName("상품 목록 조회 API 호출 (GET /api/v1/products)")
        void getProducts() throws Exception {
                // given
                ProductResponseDto p1 = ProductResponseDto.builder().id(1L).title("T1").build();
                ProductResponseDto p2 = ProductResponseDto.builder().id(2L).title("T2").build();

                given(productService.getProducts(eq(null), any())).willReturn(List.of(p1, p2));

                // when & then
                mockMvc.perform(get("/api/v1/products"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(2))
                                .andExpect(jsonPath("$[0].title").value("T1"))
                                .andExpect(jsonPath("$[1].title").value("T2"));
        }

        @Test
        @DisplayName("동네별 상품 목록 조회 API 호출 (GET /api/v1/products?regionName=강남구)")
        void getProducts_withRegionName() throws Exception {
                // given
                ProductResponseDto p1 = ProductResponseDto.builder().id(1L).title("강남 상품").regionName("강남구").build();

                given(productService.getProducts(eq("강남구"), any())).willReturn(List.of(p1));

                // when & then
                mockMvc.perform(get("/api/v1/products").param("regionName", "강남구"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(1))
                                .andExpect(jsonPath("$[0].title").value("강남 상품"))
                                .andExpect(jsonPath("$[0].regionName").value("강남구"));
        }

        @Test
        @DisplayName("상품 수정 API 호출 (PATCH /api/v1/products/{id})")
        void updateProduct() throws Exception {
                // given
                ProductUpdateRequestDto request = new ProductUpdateRequestDto(
                                "UPDATED TITLE", "DESC", 2000L, "CAT", "REGION", "RESERVED", java.util.List.of("url2"));
                ProductResponseDto response = ProductResponseDto.builder()
                                .id(1L)
                                .title("UPDATED TITLE")
                                .price(2000L)
                                .status("RESERVED")
                                .images(java.util.List.of(com.twotwo.ssadagu.domain.product.dto.ProductImageResponseDto.builder().id(2L).imageUrl("url2").build()))
                                .build();

                given(productService.updateProduct(eq(1L), any(ProductUpdateRequestDto.class), any())).willReturn(response);

                // when & then
                mockMvc.perform(patch("/api/v1/products/{id}", 1L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.title").value("UPDATED TITLE"))
                                .andExpect(jsonPath("$.status").value("RESERVED"))
                                .andExpect(jsonPath("$.images[0].imageUrl").value("url2"));
        }

        @Test
        @DisplayName("상품 삭제 API 호출 (DELETE /api/v1/products/{id})")
        void deleteProduct() throws Exception {
                // when & then
                mockMvc.perform(delete("/api/v1/products/{id}", 1L))
                                .andExpect(status().isNoContent());

                verify(productService).deleteProduct(eq(1L), any());
        }
}
