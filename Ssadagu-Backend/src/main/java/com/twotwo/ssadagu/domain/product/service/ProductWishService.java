package com.twotwo.ssadagu.domain.product.service;

import com.twotwo.ssadagu.domain.product.entity.Product;
import com.twotwo.ssadagu.domain.product.entity.ProductWish;
import com.twotwo.ssadagu.domain.product.repository.ProductRepository;
import com.twotwo.ssadagu.domain.product.repository.ProductWishRepository;
import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductWishService {

    private final ProductWishRepository productWishRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public boolean toggleWish(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        return productWishRepository.findByUserIdAndProductId(userId, productId)
                .map(wish -> {
                    productWishRepository.delete(wish);
                    product.decreaseWishCount();
                    return false;
                })
                .orElseGet(() -> {
                    ProductWish newWish = ProductWish.builder()
                            .user(user)
                            .product(product)
                            .build();
                    productWishRepository.save(newWish);
                    product.increaseWishCount();
                    return true;
                });
    }
}
