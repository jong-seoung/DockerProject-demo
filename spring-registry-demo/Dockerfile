# Ubuntu 기반
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Gradle Wrapper 복사
COPY gradlew .
COPY gradle gradle

# 빌드 스크립트 복사
COPY build.gradle .
COPY settings.gradle .

# 의존성 다운로드
RUN ./gradlew dependencies --no-daemon

# 소스코드 복사
COPY src src

# 애플리케이션 빌드
RUN ./gradlew bootJar --no-daemon

# 실행 스테이지
FROM eclipse-temurin:17-jre

# 비루트 사용자 생성
RUN groupadd -r spring && useradd -r -g spring spring
WORKDIR /app

# JAR 파일 복사
COPY --from=build /app/build/libs/spring-registry-demo-0.0.1-SNAPSHOT.jar app.jar
RUN chown spring:spring app.jar

USER spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]