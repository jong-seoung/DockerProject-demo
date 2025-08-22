# Multi-stage 빌드: 빌드 스테이지
FROM node:22-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사 (의존성 캐싱)
COPY package*.json ./

# 의존성 설치 (빌드를 위해 모든 의존성 설치)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# 소스 코드 복사
COPY src src
COPY public public
COPY index.html ./

# React 앱 빌드
RUN npm run build

# 실행 스테이지: Nginx
FROM nginx:alpine

# 빌드된 정적 파일을 Nginx 웹 루트로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]