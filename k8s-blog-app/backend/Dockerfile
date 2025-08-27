# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# package.json 먼저 복사 (캐시 최적화)
COPY package.json ./
RUN npm install

# 앱 코드 복사
COPY . .

# 설정 파일을 위한 디렉토리 생성
RUN mkdir -p /app/config

# 포트 노출
EXPOSE 3001

# 애플리케이션 실행
CMD ["node", "app.js"]