SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS simple_blog
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;
USE simple_blog;

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO posts (title, content) VALUES
('Docker 네트워킹 기초', 'Docker 컨테이너 간 통신 방법을 배워봅시다.'),
('볼륨으로 데이터 유지하기', 'Docker 볼륨을 사용하면 데이터가 영구적으로 보존됩니다.'),
('첫 번째 실습', '간단한 MySQL + Node.js 연동 실습입니다.');

SELECT 'Database initialization completed' AS status;