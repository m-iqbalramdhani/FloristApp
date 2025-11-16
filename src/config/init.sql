-- 1. users (gabungan customer + admin)
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  role ENUM('customer','admin') DEFAULT 'customer',
  status TINYINT DEFAULT 1,
  photo_url VARCHAR(512),
  fcm_token VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. categories
CREATE TABLE categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  kategori_id VARCHAR(50) UNIQUE,
  nama VARCHAR(150) NOT NULL,
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. products
CREATE TABLE products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  produk_id VARCHAR(50) UNIQUE,
  nama_produk VARCHAR(200) NOT NULL,
  kategori_id BIGINT,
  deskripsi TEXT,
  harga DECIMAL(12,2) NOT NULL DEFAULT 0,
  foto_url VARCHAR(512),
  status ENUM('active','inactive') DEFAULT 'active',
  stok INT DEFAULT 0,
  estimasi_waktu VARCHAR(50), -- e.g. '2 hari' or '6 jam' or '1-2 hari'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (kategori_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 4. uploads (opsional, untuk referensi file)
CREATE TABLE uploads (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NULL,
  file_url VARCHAR(512),
  file_type VARCHAR(50),
  related_type VARCHAR(50), -- 'product','order','payment','other'
  related_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. carts (satu per user)
CREATE TABLE carts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. cart_items
CREATE TABLE cart_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  cart_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  note TEXT,
  price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- 7. orders
CREATE TABLE orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(100) UNIQUE NOT NULL,
  user_id BIGINT NOT NULL,
  total_harga DECIMAL(12,2) NOT NULL,
  status INT DEFAULT 0, -- 0=pending,1=confirmed,2=processing,3=ready,4=completed,5=cancelled
  payment_method VARCHAR(50),
  bukti_pembayaran_url VARCHAR(512),
  note TEXT,
  alamat TEXT,
  tanggal_order DATETIME DEFAULT CURRENT_TIMESTAMP,
  tanggal_ambil DATE NULL,
  estimasi_selesai DATETIME NULL, -- tanggal terestimasi selesai (tanggal_order + estimasi produk / calculation)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. order_items
CREATE TABLE order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  kuantitas INT NOT NULL,
  price_per_item DECIMAL(12,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- 9. invoices (opsional)
CREATE TABLE invoices (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  invoice_id VARCHAR(100) UNIQUE NOT NULL,
  order_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  nomor_invoice VARCHAR(100),
  total_harga DECIMAL(12,2),
  tanggal DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. notifications_log (opsional, simpan log notifikasi)
CREATE TABLE notifications_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  order_id BIGINT NULL,
  title VARCHAR(200),
  body TEXT,
  payload JSON NULL,
  status ENUM('sent','failed') DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
