-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blog_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample users
INSERT INTO users (username, email, password) VALUES
('admin', 'admin@example.com', '$2a$10$N0nYRw.bzOBPM1q0fZxqcOqFSfJnHKBq/s24rEd.n8u5VjFzHUdv6'),
('john_doe', 'john@example.com', '$2a$10$N0nYRw.bzOBPM1q0fZxqcOqFSfJnHKBq/s24rEd.n8u5VjFzHUdv6'),
('jane_smith', 'jane@example.com', '$2a$10$N0nYRw.bzOBPM1q0fZxqcOqFSfJnHKBq/s24rEd.n8u5VjFzHUdv6');

-- Insert sample posts (한글 데이터)
INSERT INTO posts (title, content, author_id) VALUES
('Docker와 컨테이너 기술', '컨테이너 기술은 현대 개발에서 필수적인 요소가 되었습니다...', 1),
('Spring Boot 마이크로서비스', 'Spring Boot를 활용한 마이크로서비스 아키텍처 구성 방법...', 2),
('React와 백엔드 API 연동', 'React 애플리케이션에서 RESTful API를 효과적으로 활용하는 방법...', 3),
('MySQL 성능 최적화', '대용량 데이터 처리를 위한 MySQL 튜닝 가이드...', 1),
('DevOps와 CI/CD', '지속적 통합과 배포를 통한 개발 프로세스 개선...', 2);

-- Verification queries
SELECT 'Database initialization completed' AS status;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS post_count FROM posts;