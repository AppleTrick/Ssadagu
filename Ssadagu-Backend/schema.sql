SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- =========================================================
-- 1) USERS
-- =========================================================
CREATE TABLE users (
  user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,

  PRIMARY KEY (user_id),

  KEY idx_users_email (email),
  KEY idx_users_nickname (nickname),
  KEY idx_users_status (status),
  KEY idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- 2) USER_ACCOUNTS
-- =========================================================
CREATE TABLE user_accounts (
  account_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  bank_code VARCHAR(20) NOT NULL,
  bank_name VARCHAR(50) NOT NULL,
  account_number_enc VARCHAR(255) NOT NULL,
  account_hash VARCHAR(64) NOT NULL,
  account_holder_name VARCHAR(100),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  verified_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  verified_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,

  PRIMARY KEY (account_id),

  UNIQUE KEY uk_account_hash (account_hash),
  KEY idx_user_accounts_user (user_id),

  CONSTRAINT fk_user_accounts_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- 3) ACCOUNT_VERIFICATIONS
-- =========================================================
CREATE TABLE account_verifications (
  verification_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  account_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  sent_amount INT NOT NULL DEFAULT 1,
  verify_code_hash VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'SENT',
  expires_at DATETIME NOT NULL,
  requested_at DATETIME NOT NULL,
  verified_at DATETIME NULL,

  PRIMARY KEY (verification_id),

  KEY idx_acc_verif_account (account_id),
  KEY idx_acc_verif_user (user_id),
  KEY idx_acc_verif_expires (expires_at),

  CONSTRAINT fk_acc_verif_account
    FOREIGN KEY (account_id) REFERENCES user_accounts(account_id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_acc_verif_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- 4) PRODUCTS
-- =========================================================
CREATE TABLE products (
  product_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  seller_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  category_code VARCHAR(50) NOT NULL,
  region_name VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'ON_SALE',
  wish_count INT NOT NULL DEFAULT 0,
  chat_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,

  PRIMARY KEY (product_id),

  KEY idx_products_seller (seller_id),
  KEY idx_products_category_status_date (category_code, status, created_at),
  KEY idx_products_region (region_name),

  CONSTRAINT fk_products_seller
    FOREIGN KEY (seller_id) REFERENCES users(user_id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- 5) PRODUCT_IMAGES
-- =========================================================
CREATE TABLE product_images (
  image_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,

  PRIMARY KEY (image_id),

  KEY idx_product_images_product_sort (product_id, sort_order),

  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- 6) PRODUCT_WISHES
-- =========================================================
CREATE TABLE product_wishes (
  wish_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,

  PRIMARY KEY (wish_id),

  UNIQUE KEY uk_product_wish (user_id, product_id),
  KEY idx_product_wishes_user (user_id),
  KEY idx_product_wishes_product (product_id),

  CONSTRAINT fk_product_wishes_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_product_wishes_product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- 7) CHAT_ROOMS
-- =========================================================
CREATE TABLE chat_rooms (
  room_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  buyer_id BIGINT UNSIGNED NOT NULL,
  seller_id BIGINT UNSIGNED NOT NULL,
  last_message TEXT,
  last_sent_at DATETIME,
  unread_count_buyer INT NOT NULL DEFAULT 0,
  unread_count_seller INT NOT NULL DEFAULT 0,
  room_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL,

  PRIMARY KEY (room_id),

  UNIQUE KEY uk_chat_rooms_product_buyer (product_id, buyer_id),
  KEY idx_chat_rooms_buyer (buyer_id, last_sent_at),
  KEY idx_chat_rooms_seller (seller_id, last_sent_at),

  CONSTRAINT fk_chat_rooms_product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_chat_rooms_buyer
    FOREIGN KEY (buyer_id) REFERENCES users(user_id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_chat_rooms_seller
    FOREIGN KEY (seller_id) REFERENCES users(user_id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- 8) TRANSACTIONS
-- =========================================================
CREATE TABLE transactions (
  transaction_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  buyer_id BIGINT UNSIGNED NOT NULL,
  seller_id BIGINT UNSIGNED NOT NULL,
  amount BIGINT NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  bank_transaction_id VARCHAR(100) NOT NULL,
  status VARCHAR(30) NOT NULL,
  fail_reason VARCHAR(255),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,

  PRIMARY KEY (transaction_id),

  UNIQUE KEY uk_transactions_bank_tx (bank_transaction_id),
  UNIQUE KEY uk_transactions_product_once (product_id),

  KEY idx_transactions_buyer (buyer_id, created_at),
  KEY idx_transactions_seller (seller_id, created_at),

  CONSTRAINT fk_transactions_product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_transactions_buyer
    FOREIGN KEY (buyer_id) REFERENCES users(user_id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_transactions_seller
    FOREIGN KEY (seller_id) REFERENCES users(user_id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;