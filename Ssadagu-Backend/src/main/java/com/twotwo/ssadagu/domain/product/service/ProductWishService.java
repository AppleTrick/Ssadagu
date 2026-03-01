package com.twotwo.ssadagu.domain.product.service;

import com.twotwo.ssadagu.domain.product.repository.ProductWishRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductWishService {

    private final ProductWishRepository productWishRepository;

}
