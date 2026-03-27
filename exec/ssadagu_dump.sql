-- ============================================================
-- schema.sql - 실제 운영 DB 기준 (2026-03-17 갱신)
-- JPA ddl-auto=update 로 관리되는 실제 스키마와 동일
-- ============================================================

CREATE TABLE users (
    user_id       BIGINT        NOT NULL AUTO_INCREMENT,
    email         VARCHAR(255)  NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    nickname      VARCHAR(50)   NOT NULL,
    region        VARCHAR(100)  DEFAULT NULL,
    user_key      VARCHAR(100)  DEFAULT NULL,
    status        VARCHAR(20)   NOT NULL,
    created_at    DATETIME(6)   NOT NULL,
    updated_at    DATETIME(6)   NOT NULL,
    deleted_at    DATETIME(6)   DEFAULT NULL,

    PRIMARY KEY (user_id),
    UNIQUE KEY UK6dotkott2kjsp8vw4d0m25fb7 (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE user_accounts (
    account_id          BIGINT        NOT NULL AUTO_INCREMENT,
    user_id             BIGINT        NOT NULL,
    bank_code           VARCHAR(20)   NOT NULL,
    bank_name           VARCHAR(50)   NOT NULL,
    account_number      VARCHAR(255)  NOT NULL,
    account_hash        VARCHAR(64)   NOT NULL,
    account_holder_name VARCHAR(100)  DEFAULT NULL,
    is_primary          BIT(1)        NOT NULL,
    verified_status     VARCHAR(20)   NOT NULL,
    verified_at         DATETIME(6)   DEFAULT NULL,
    created_at          DATETIME(6)   NOT NULL,
    updated_at          DATETIME(6)   NOT NULL,
    deleted_at          DATETIME(6)   DEFAULT NULL,

    PRIMARY KEY (account_id),
    UNIQUE KEY UK8o642jss0gbxconmpyu9hke6m (user_id),
    UNIQUE KEY UKofc5erovn45h192nktvrxiaax (account_hash),

    CONSTRAINT FKeu175seh3s7swirv0s1ugieyu
        FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE account_verifications (
    verification_id BIGINT        NOT NULL AUTO_INCREMENT,
    account_id      BIGINT        NOT NULL,
    user_id         BIGINT        NOT NULL,
    sent_amount     INT           NOT NULL,
    verify_code_hash VARCHAR(255) NOT NULL,
    status          VARCHAR(20)   NOT NULL,
    expires_at      DATETIME(6)   NOT NULL,
    requested_at    DATETIME(6)   NOT NULL,
    verified_at     DATETIME(6)   DEFAULT NULL,

    PRIMARY KEY (verification_id),

    CONSTRAINT FKefn3m3nn48rj5e86bibpoef3w
        FOREIGN KEY (account_id) REFERENCES user_accounts (account_id),
    CONSTRAINT FK94ln0yiixbfoyi9lnappe79k4
        FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE refresh_tokens (
    rt_key   VARCHAR(255) NOT NULL,
    rt_value VARCHAR(255) NOT NULL,

    PRIMARY KEY (rt_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE products (
    product_id  BIGINT        NOT NULL AUTO_INCREMENT,
    seller_id   BIGINT        NOT NULL,
    title       VARCHAR(200)  NOT NULL,
    description TEXT          DEFAULT NULL,
    price       BIGINT        NOT NULL,
    category_code VARCHAR(50) NOT NULL,
    region_name VARCHAR(100)  DEFAULT NULL,
    status      VARCHAR(20)   NOT NULL,
    wish_count  INT           NOT NULL,
    chat_count  INT           NOT NULL,
    created_at  DATETIME(6)   NOT NULL,
    updated_at  DATETIME(6)   NOT NULL,
    deleted_at  DATETIME(6)   DEFAULT NULL,

    PRIMARY KEY (product_id),

    CONSTRAINT FKbgw3lyxhsml3kfqnfr45o0vbj
        FOREIGN KEY (seller_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE product_images (
    image_id   BIGINT        NOT NULL AUTO_INCREMENT,
    product_id BIGINT        NOT NULL,
    image_url  VARCHAR(500)  NOT NULL,
    sort_order INT           NOT NULL,
    created_at DATETIME(6)   NOT NULL,

    PRIMARY KEY (image_id),

    CONSTRAINT FKqnq71xsohugpqwf3c9gxmsuy
        FOREIGN KEY (product_id) REFERENCES products (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE product_wishes (
    wish_id    BIGINT      NOT NULL AUTO_INCREMENT,
    user_id    BIGINT      NOT NULL,
    product_id BIGINT      NOT NULL,
    created_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) DEFAULT NULL,

    PRIMARY KEY (wish_id),
    UNIQUE KEY uk_user_product (user_id, product_id),

    CONSTRAINT FKa9qmhuvj7bm4btwwf0wxvit6n
        FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT FK944gt9671364e7v27y5f2e6fu
        FOREIGN KEY (product_id) REFERENCES products (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE chat_rooms (
    room_id              BIGINT      NOT NULL AUTO_INCREMENT,
    product_id           BIGINT      NOT NULL,
    buyer_id             BIGINT      NOT NULL,
    seller_id            BIGINT      NOT NULL,
    last_message         TEXT        DEFAULT NULL,
    last_sent_at         DATETIME(6) DEFAULT NULL,
    unread_count_buyer   INT         NOT NULL,
    unread_count_seller  INT         NOT NULL,
    room_status          VARCHAR(20) NOT NULL,
    created_at           DATETIME(6) NOT NULL,

    PRIMARY KEY (room_id),
    UNIQUE KEY uk_product_buyer (product_id, buyer_id),

    CONSTRAINT FKo52t6lfonn86xk7t8vapqkniv
        FOREIGN KEY (product_id) REFERENCES products (product_id),
    CONSTRAINT FKhbap39tpdxxb39tf4qmovcb18
        FOREIGN KEY (buyer_id) REFERENCES users (user_id),
    CONSTRAINT FKc3j4hkkph4fy04l2t23kcl8os
        FOREIGN KEY (seller_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE chat_messages (
    message_id    BIGINT       NOT NULL AUTO_INCREMENT,
    room_id       BIGINT       NOT NULL,
    sender_id     BIGINT       DEFAULT NULL,
    content       TEXT         DEFAULT NULL,
    image_url     VARCHAR(500) DEFAULT NULL,
    latitude      DOUBLE       DEFAULT NULL,
    longitude     DOUBLE       DEFAULT NULL,
    location_name VARCHAR(255) DEFAULT NULL,
    message_type  ENUM('ENTER','IMAGE','LEAVE','MAP','PAYMENT_FAIL','PAYMENT_REQUEST','PAYMENT_SUCCESS','SYSTEM','TALK') NOT NULL,
    is_read       BIT(1)       NOT NULL DEFAULT 0,
    created_at    DATETIME(6)  DEFAULT NULL,

    PRIMARY KEY (message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE transactions (
    transaction_id      BIGINT       NOT NULL AUTO_INCREMENT,
    product_id          BIGINT       NOT NULL,
    buyer_id            BIGINT       NOT NULL,
    seller_id           BIGINT       NOT NULL,
    amount              BIGINT       NOT NULL,
    payment_method      VARCHAR(20)  NOT NULL,
    bank_transaction_id VARCHAR(100) NOT NULL,
    status              VARCHAR(30)  NOT NULL,
    fail_reason         VARCHAR(255) DEFAULT NULL,
    created_at          DATETIME(6)  NOT NULL,
    updated_at          DATETIME(6)  NOT NULL,

    PRIMARY KEY (transaction_id),
    UNIQUE KEY UK31xtofxeuru0gl9jg6f8537mr (product_id),
    UNIQUE KEY UKscnwuho3lxwg6pjw69kco778v (bank_transaction_id),

    CONSTRAINT FKcdpkn7bkq15bjvlw9mo46l9ft
        FOREIGN KEY (product_id) REFERENCES products (product_id),
    CONSTRAINT FKijk7ii2fvalv59schbb3ee0bof
        FOREIGN KEY (buyer_id) REFERENCES users (user_id),
    CONSTRAINT FK50i2jege2ukupf1ynv0dq6eax
        FOREIGN KEY (seller_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;