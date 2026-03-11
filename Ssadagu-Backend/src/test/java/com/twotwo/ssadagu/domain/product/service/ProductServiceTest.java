package com.twotwo.ssadagu.domain.product.service;

import com.twotwo.ssadagu.domain.product.dto.ProductCreateRequestDto;
import com.twotwo.ssadagu.domain.product.dto.ProductResponseDto;
import com.twotwo.ssadagu.domain.product.dto.ProductUpdateRequestDto;
import com.twotwo.ssadagu.domain.product.entity.Product;
import com.twotwo.ssadagu.domain.product.repository.ProductRepository;
import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
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

    @Test
    @DisplayName("상품을 성공적으로 생성한다.")
    void createProduct() {
        // given
        User seller = User.builder().build();
        ReflectionTestUtils.setField(seller, "id", 1L);

        ProductCreateRequestDto request = new ProductCreateRequestDto(
                1L, "테스트 상품", "명품 시계입니다.", 100000L, "FASHION", "강남구");

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
        ProductResponseDto response = productService.createProduct(request);

        // then
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getTitle()).isEqualTo("테스트 상품");
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
        ReflectionTestUtils.setField(product, "id", 1L);

        given(productRepository.findById(1L)).willReturn(Optional.of(product));

        // when
        ProductResponseDto response = productService.getProduct(1L);

        // then
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getTitle()).isEqualTo("조회 테스트 상품");
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
        assertThatThrownBy(() -> productService.getProduct(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Product is deleted");
    }

    @Test
    @DisplayName("삭제되지 않은 상품 목록을 전체 조회한다.")
    void getProducts() {
        // given
        User seller = User.builder().build();
        ReflectionTestUtils.setField(seller, "id", 1L);

        Product p1 = Product.builder().seller(seller).title("p1").status("ON_SALE").build();
        Product p2 = Product.builder().seller(seller).title("p2").status("DELETED").build();
        Product p3 = Product.builder().seller(seller).title("p3").status("RESERVED").build();

        given(productRepository.findAll()).willReturn(List.of(p1, p2, p3));

        // when
        List<ProductResponseDto> responseDtos = productService.getProducts();

        // then
        assertThat(responseDtos).hasSize(2); // p1, p3
        assertThat(responseDtos.get(0).getTitle()).isEqualTo("p1");
        assertThat(responseDtos.get(1).getTitle()).isEqualTo("p3");
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
                "수정된 이름", "내용수정", 2000L, "CATEGORY", "SEOUL", "RESERVED");

        // when
        ProductResponseDto response = productService.updateProduct(1L, request);

        // then
        assertThat(response.getTitle()).isEqualTo("수정된 이름");
        assertThat(response.getPrice()).isEqualTo(2000L);
        assertThat(response.getStatus()).isEqualTo("RESERVED");
        assertThat(product.getTitle()).isEqualTo("수정된 이름"); // Entity 업데이트 확인
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
        productService.deleteProduct(1L);

        // then
        assertThat(product.getStatus()).isEqualTo("DELETED");
        assertThat(product.getDeletedAt()).isNotNull();
    }
}
