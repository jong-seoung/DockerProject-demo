# frontend/Dockerfile
FROM nginx:alpine

# 기본 nginx.conf 삭제
RUN rm /etc/nginx/conf.d/default.conf

# 정적 파일 복사
COPY index.html /usr/share/nginx/html/

# 포트 노출
EXPOSE 80

# nginx 시작
CMD ["nginx", "-g", "daemon off;"]