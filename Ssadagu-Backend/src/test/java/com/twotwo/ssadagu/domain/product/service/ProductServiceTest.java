package com.twotwo.ssadagu.domain.product.service;

import com.twotwo.ssadagu.domain.product.dto.ProductCreateRequestDto;
import com.twotwo.ssadagu.domain.product.dto.ProductResponseDto;
import com.twotwo.ssadagu.domain.product.dto.ProductUpdateRequestDto;
import com.twotwo.ssadagu.domain.product.entity.Product;
import com.twotwo.ssadagu.domain.product.repository.ProductRepository;
import com.twotwo.ssadagu.domain.product.repository.ProductWishRepository;
import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.domain.user.repository.UserRepository;
import com.twotwo.ssadagu.global.error.BusinessException;
import com.twotwo.ssadagu.global.error.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @InjectMocks
    private ProductService productService;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductWishRepository productWishRepository;

    @Mock
    private com.twotwo.ssadagu.global.service.S3Service s3Service;

    @Test
    @DisplayName("상품을 성공적으로 생성한다.")
    void createProduct() {
        // given
        User seller = User.builder().build();
        ReflectionTestUtils.setField(seller, "id", 1L);

        ProductCreateRequestDto request = new ProductCreateRequestDto(
                1L, "테스트 상품", "명품 시계입니다.", 100000L, "FASHION", "강남구", java.util.List.of("url1", "url2"));

        Product product = Product.builder()
                .seller(seller)
                .title(request.getTitle())
                .price(request.getPrice())
                .status("ON_SALE")
                .build();
        ReflectionTestUtils.setField(product, "id", 100L);

        given(userRepository.findById(1L)).willReturn(Optional.of(seller));
        given(productRepository.save(any(Product.class))).willReturn(product);

        // when
        ProductResponseDto response = productService.createProduct(request, null);

        // then
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getTitle()).isEqualTo("테스트 상품");
        assertThat(response.getIsMine()).isTrue();
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("상품을 단건 조회한다.")
    void getProduct() {
        // given
        User seller = User.builder().build();
        ReflectionTestUtils.setField(seller, "id", 1L);

        Product product = Product.builder()
                .seller(seller)
                .title("조회 테스트 상품")
                .status("ON_SALE")
                .build();
        ReflectionTestUtils.setField(product, "id", 100L);

        given(productRepository.findById(100L)).willReturn(Optional.of(product));
        given(productWishRepository.existsByUserIdAndProductId(1L, 100L)).willReturn(true);

        // when
        ProductResponseDto response = productService.getProduct(100L, 1L);

        // then
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getTitle()).isEqualTo("조회 테스트 상품");
        assertThat(response.getIsMine()).isTrue();
        assertThat(response.getIsLiked()).isTrue();
    }

    @Test
    @DisplayName("삭제된 상품을 단건 조회하면 예외가 발생한다.")
    void getProduct_Deleted() {
        // given
        User seller = User.builder().build();
        ReflectionTestUtils.setField(seller, "id", 1L);

        Product product = Product.builder().seller(seller).status("DELETED").build();
        given(productRepository.findById(1L)).willReturn(Optional.of(product));

        // when & then
        assertThatThrownBy(() -> productService.getProduct(1L, null))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PRODUCT_NOT_FOUND);
    }

    @Test
    @DisplayName("regionName 없으면 삭제되지 않은 상품 전체를 조회한다.")
    void getProducts_noRegion() {
        // given
        User seller = User.builder().build();
        ReflectionTestUtils.setField(seller, "id", 2L); // 2번 유저가 판매자

        Product p1 = Product.builder().seller(seller).title("p1").status("ON_SALE").regionName("강남구").build();
        ReflectionTestUtils.setField(p1, "id", 10L);

        given(productRepository.findByStatusNotOrderByCreatedAtDesc("DELETED")).willReturn(List.of(p1));
        given(productWishRepository.existsByUserIdAndProductId(1L, 10L)).willReturn(false);

        // when
        List<ProductResponseDto> responseDtos = productService.getProducts(null, null, 1L); // 1번 유저가 조회

        // then
        assertThat(responseDtos).hasSize(1);
        assertThat(responseDtos.get(0).getTitle()).isEqualTo("p1");
        assertThat(responseDtos.get(0).getIsMine()).isFalse();
    }

    @Test
    @DisplayName("상품 정보 수정에 성공한다.")
    void updateProduct() {
        // given
        User seller = User.builder().build();
        ReflectionTestUtils.setField(seller, "id", 1L);

        Product product = Product.builder()
                .seller(seller)
                .title("원래 이름")
                .price(1000L)
                .status("ON_SALE")
                .build();
        ReflectionTestUtils.setField(product, "id", 1L);

        given(productRepository.findById(1L)).willReturn(Optional.of(product));

        ProductUpdateRequestDto request = new ProductUpdateRequestDto(
                "수정된 이름", "내용수정", 2000L, "CATEGORY", "SEOUL", "RESERVED", java.util.List.of("newUrl1"));

        // when
        ProductResponseDto response = productService.updateProduct(1L, request, null, 1L);

        // then
        assertThat(response.getTitle()).isEqualTo("수정된 이름");
        assertThat(response.getIsMine()).isTrue();
        assertThat(product.getTitle()).isEqualTo("수정된 이름");
    }

    @Test
    @DisplayName("권한이 없는 사용자가 상품 수정을 시도하면 예외가 발생한다.")
    void updateProduct_NoPermission() {
        // given
        User seller = User.builder().build();
        ReflectionTestUtils.setField(seller, "id", 1L);

        Product product = Product.builder().seller(seller).status("ON_SALE").build();
        ReflectionTestUtils.setField(product, "id", 1L);

        given(productRepository.findById(1L)).willReturn(Optional.of(product));

        ProductUpdateRequestDto request = new ProductUpdateRequestDto(
                "제목", "설명", 1000L, "C", "R", "ON_SALE", null);

        // when & then
        assertThatThrownBy(() -> productService.updateProduct(1L, request, null, 2L)) // 2번 유저가 시도
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.NOT_PRODUCT_SELLER);
    }

    @Test
    @DisplayName("상품(게시글)을 논리적으로 삭제한다.")
    void deleteProduct() {
        // given
        User seller = User.builder().build();
        ReflectionTestUtils.setField(seller, "id", 1L);

        Product product = Product.builder()
                .seller(seller)
                .title("삭제될 상품")
                .status("ON_SALE")
                .build();
        ReflectionTestUtils.setField(product, "id", 1L);

        given(productRepository.findById(1L)).willReturn(Optional.of(product));

        // when
        productService.deleteProduct(1L, 1L);

        // then
        assertThat(product.getStatus()).isEqualTo("DELETED");
        assertThat(product.getDeletedAt()).isNotNull();
    }

    @Test
    @DisplayName("이미지가 5개를 초과하면 상품 생성 시 예외가 발생한다.")
    void createProduct_ImageLimitExceeded() {
        // given
        User seller = User.builder().build();
        ReflectionTestUtils.setField(seller, "id", 1L);

        ProductCreateRequestDto request = new ProductCreateRequestDto(
                1L, "테스트 상품", "설명", 1000L, "CATEGORY", "REGION", 
                java.util.List.of("1", "2", "3", "4", "5", "6"));

        given(userRepository.findById(1L)).willReturn(Optional.of(seller));

        // when & then
        assertThatThrownBy(() -> productService.createProduct(request, List.of(
                org.mockito.Mockito.mock(org.springframework.web.multipart.MultipartFile.class),
                org.mockito.Mockito.mock(org.springframework.web.multipart.MultipartFile.class),
                org.mockito.Mockito.mock(org.springframework.web.multipart.MultipartFile.class),
                org.mockito.Mockito.mock(org.springframework.web.multipart.MultipartFile.class),
                org.mockito.Mockito.mock(org.springframework.web.multipart.MultipartFile.class),
                org.mockito.Mockito.mock(org.springframework.web.multipart.MultipartFile.class)
        )))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_INPUT_VALUE);
    }
}
