CREATE TABLE users (
                       user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       email VARCHAR(255) NOT NULL,
                       password_hash VARCHAR(255) NOT NULL,
                       nickname VARCHAR(50) NOT NULL,
                       region VARCHAR(100) NOT NULL,
                       status ENUM('ACTIVE','SUSPENDED','DELETED') NOT NULL DEFAULT 'ACTIVE',
                       created_at TIMESTAMP NOT NULL,
                       updated_at TIMESTAMP NOT NULL,
                       deleted_at TIMESTAMP NULL,

                       INDEX idx_users_email (email),
                       INDEX idx_users_nickname (nickname),
                       INDEX idx_users_status (status),
                       INDEX idx_users_created_at (created_at)
);

CREATE TABLE user_accounts (
                               account_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                               user_id BIGINT NOT NULL UNIQUE,
                               bank_code VARCHAR(20) NOT NULL,
                               bank_name VARCHAR(50) NOT NULL,
                               account_number VARCHAR(255) NOT NULL,
                               account_hash VARCHAR(64) NOT NULL UNIQUE,
                               account_holder_name VARCHAR(100),
                               is_primary BOOLEAN NOT NULL DEFAULT FALSE,
                               verified_status ENUM('PENDING','VERIFIED','FAILED') NOT NULL DEFAULT 'PENDING',
                               verified_at TIMESTAMP NULL,
                               created_at TIMESTAMP NOT NULL,
                               updated_at TIMESTAMP NOT NULL,
                               deleted_at TIMESTAMP NULL,

                               CONSTRAINT fk_user_accounts_user
                                   FOREIGN KEY (user_id)
                                       REFERENCES users(user_id)
);

CREATE TABLE account_verifications (
                                       verification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                       account_id BIGINT NOT NULL,
                                       user_id BIGINT NOT NULL,
                                       sent_amount INT NOT NULL DEFAULT 1,
                                       verify_code_hash VARCHAR(255) NOT NULL,
                                       status ENUM('SENT','VERIFIED','EXPIRED','FAILED') NOT NULL DEFAULT 'SENT',
                                       expires_at TIMESTAMP NOT NULL,
                                       requested_at TIMESTAMP NOT NULL,
                                       verified_at TIMESTAMP NULL,

                                       INDEX idx_verification_account (account_id),
                                       INDEX idx_verification_user (user_id),
                                       INDEX idx_verification_expires (expires_at),

                                       CONSTRAINT fk_verification_account
                                           FOREIGN KEY (account_id)
                                               REFERENCES user_accounts(account_id),

                                       CONSTRAINT fk_verification_user
                                           FOREIGN KEY (user_id)
                                               REFERENCES users(user_id)
);

CREATE TABLE products (
                          product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          seller_id BIGINT NOT NULL,
                          title VARCHAR(200) NOT NULL,
                          description TEXT,
                          price BIGINT NOT NULL,
                          category_code VARCHAR(50) NOT NULL,
                          region_name VARCHAR(100),
                          status ENUM('ON_SALE','RESERVED','SOLD','DELETED') NOT NULL DEFAULT 'ON_SALE',
                          wish_count INT NOT NULL DEFAULT 0,
                          chat_count INT NOT NULL DEFAULT 0,
                          created_at TIMESTAMP NOT NULL,
                          updated_at TIMESTAMP NOT NULL,
                          deleted_at TIMESTAMP NULL,

                          INDEX idx_products_seller (seller_id),
                          INDEX idx_products_category_status_created (category_code, status, created_at),
                          INDEX idx_products_region (region_name),

                          CONSTRAINT fk_products_seller
                              FOREIGN KEY (seller_id)
                                  REFERENCES users(user_id)
);

CREATE TABLE product_images (
                                image_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                product_id BIGINT NOT NULL,
                                image_url VARCHAR(500) NOT NULL,
                                sort_order INT NOT NULL DEFAULT 0,
                                created_at TIMESTAMP NOT NULL,

                                INDEX idx_product_images_product_sort (product_id, sort_order),

                                CONSTRAINT fk_product_images_product
                                    FOREIGN KEY (product_id)
                                        REFERENCES products(product_id)
);

CREATE TABLE product_wishes (
                                wish_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                user_id BIGINT NOT NULL,
                                product_id BIGINT NOT NULL,
                                created_at TIMESTAMP NOT NULL,
                                deleted_at TIMESTAMP NULL,

                                UNIQUE KEY uk_user_product (user_id, product_id),

                                INDEX idx_wish_user (user_id),
                                INDEX idx_wish_product (product_id),

                                CONSTRAINT fk_wish_user
                                    FOREIGN KEY (user_id)
                                        REFERENCES users(user_id),

                                CONSTRAINT fk_wish_product
                                    FOREIGN KEY (product_id)
                                        REFERENCES products(product_id)
);

CREATE TABLE chat_rooms (
                            room_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            product_id BIGINT NOT NULL,
                            buyer_id BIGINT NOT NULL,
                            seller_id BIGINT NOT NULL,
                            last_message TEXT,
                            last_sent_at TIMESTAMP NULL,
                            unread_count_buyer INT NOT NULL DEFAULT 0,
                            unread_count_seller INT NOT NULL DEFAULT 0,
                            room_status ENUM('ACTIVE','CLOSED','DELETED') NOT NULL DEFAULT 'ACTIVE',
                            created_at TIMESTAMP NOT NULL,

                            UNIQUE KEY uk_product_buyer (product_id, buyer_id),

                            INDEX idx_chat_buyer_last (buyer_id, last_sent_at),
                            INDEX idx_chat_seller_last (seller_id, last_sent_at),

                            CONSTRAINT fk_chat_product
                                FOREIGN KEY (product_id)
                                    REFERENCES products(product_id),

                            CONSTRAINT fk_chat_buyer
                                FOREIGN KEY (buyer_id)
                                    REFERENCES users(user_id),

                            CONSTRAINT fk_chat_seller
                                FOREIGN KEY (seller_id)
                                    REFERENCES users(user_id)
);

CREATE TABLE transactions (
                              transaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                              product_id BIGINT NOT NULL,
                              buyer_id BIGINT NOT NULL,
                              seller_id BIGINT NOT NULL,
                              amount BIGINT NOT NULL,
                              payment_method ENUM('BANK_TRANSFER','CARD','PAY') NOT NULL,
                              bank_transaction_id VARCHAR(100) NOT NULL UNIQUE,
                              status ENUM('PENDING','SUCCESS','FAILED','CANCELLED') NOT NULL,
                              fail_reason VARCHAR(255),
                              created_at TIMESTAMP NOT NULL,
                              updated_at TIMESTAMP NOT NULL,

                              UNIQUE KEY uk_transaction_product (product_id),

                              INDEX idx_transaction_buyer_created (buyer_id, created_at),
                              INDEX idx_transaction_seller_created (seller_id, created_at),

                              CONSTRAINT fk_transaction_product
                                  FOREIGN KEY (product_id)
                                      REFERENCES products(product_id),

                              CONSTRAINT fk_transaction_buyer
                                  FOREIGN KEY (buyer_id)
                                      REFERENCES users(user_id),

                              CONSTRAINT fk_transaction_seller
                                  FOREIGN KEY (seller_id)
                                      REFERENCES users(user_id)
);