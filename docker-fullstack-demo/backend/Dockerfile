# Multi-stage 빌드를 위한 빌드 스테이지
FROM eclipse-temurin:17-jdk-jammy AS builder

# 작업 디렉토리 설정
WORKDIR /app

# Gradle 설정 파일들 복사
COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle

# 의존성 다운로드 (캐시 최적화)
RUN chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon

# 소스 코드 복사 및 빌드
COPY src src
RUN ./gradlew bootJar --no-daemon

# 실행 스테이지
FROM eclipse-temurin:17-jre-jammy

# curl 설치 (헬스체크용)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# 비루트 사용자 생성 (Ubuntu 방식)
RUN addgroup --system spring && adduser --system spring --ingroup spring

# 작업 디렉토리 설정
WORKDIR /app

# 빌드된 JAR 파일 복사 (와일드카드 사용)
COPY --from=builder /app/build/libs/*.jar app.jar

# 권한 설정
RUN chown spring:spring app.jar
USER spring

# 포트 노출
EXPOSE 8080

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/posts/health || exit 1

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]