package com.twotwo.ssadagu.domain.product.entity;

import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Long price;

    @Column(name = "category_code", nullable = false, length = 50)
    private String categoryCode;

    @Column(name = "region_name", length = 100)
    private String regionName;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "wish_count", nullable = false)
    private Integer wishCount;

    @Column(name = "chat_count", nullable = false)
    private Integer chatCount;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<ProductImage> images = new java.util.ArrayList<>();

    public void update(String title, String description, Long price, String categoryCode, String regionName,
            String status) {
        if (title != null)
            this.title = title;
        if (description != null)
            this.description = description;
        if (price != null)
            this.price = price;
        if (categoryCode != null)
            this.categoryCode = categoryCode;
        if (regionName != null)
            this.regionName = regionName;
        if (status != null)
            this.status = status;
    }

    public void markAsDeleted() {
        this.status = "DELETED";
        this.deletedAt = LocalDateTime.now();
    }

    public void increaseWishCount() {
        this.wishCount++;
    }

    public void decreaseWishCount() {
        if (this.wishCount > 0) {
            this.wishCount--;
        }
    }
}
