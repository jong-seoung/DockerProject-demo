# Docker 레지스트리에 이미지 Push & pull
> 레지스트리는 Docker 이미지를 저장하고 배포하는 클라우드 저장소이다. <br>
> 이를 활용하면 Docker Hub에 업로드하여 어디서든 다운하여 실행할 수 있는 공유 가능한 컨테이너를 구축 가능하다

## 이미지 네이밍 규칙
```
# 기본 형식
[레지스트리_호스트]/[네임스페이스]/[이미지명]:[태그]

# Docker Hub 예시
docker.io/username/myapp:1.0
docker.io/username/myapp:latest

# 다른 레지스트리 예시  
gcr.io/project-id/myapp:1.0
myregistry.com:5000/team/myapp:1.0
```

## 빌드 최적화 전략
Docker 이미지 빌드 성능과 운영 효율성을 높이기 위해 사용된다.

### .dockerignore 활용
불필요한 파일들을 Docker빌드에서 제외함으로써, 빌드 속도를 향상 시킨다.
```
# .dockerignore 파일
node_modules/
*.log
.git/
.DS_Store
target/
*.tmp
```

### 멀티스테이지 빌드
```
# 빌드 스테이지
FROM gradle:8.5-jdk17 AS builder
WORKDIR /app
COPY . .
RUN gradle build --no-daemon
# 실행 스테이지  
FROM openjdk:17-jre-slim
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```
- 빌드 환경과 실행 환경 분리
    - 빌드용 이미지는 Gradle, JDK 등 큰 용량 도구 포함 → 이미지 무거움
    - 실행용 이미지는 JRE만 포함 → 이미지 가벼움, 배포 효율 ↑
- 최종 이미지 크기 감소
    - 빌드 아티팩트만 복사 → 불필요한 캐시/툴 제외
    - 보안상 취약점 감소(빌드 도구가 포함되지 않음)
- 배포 속도 향상
    - 작은 이미지는 푸시/풀 속도 빠름, 클라우드 환경에서 비용 절감

### 레이어 최적화
```
# ❌ 비효율적 - 매번 의존성 재설치
COPY . .
RUN gradle build

# ✅ 효율적 - 의존성 캐싱
COPY build.gradle settings.gradle ./
COPY gradle gradle
RUN gradle dependencies --no-daemon
COPY src src  
RUN gradle build --no-daemon
```

- 의존성 파일(`build.gradle`)을 먼저 복사해서 캐싱
- 소스코드만 변경되면 의존성 다운로드는 건너뛰고 빌드만 재실행

## 실습
### Docker Hub 회원가입 
https://hub.docker.com 

### 로컬에서 로그인
```
# Docker Hub 로그인
docker login
# Username과 Password 입력
```

### 프로젝트 구조
```
spring-registry-demo/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/example/demo/
│       │       ├── DemoApplication.java
│       │       └── controller/
│       │           └── HelloController.java
│       └── resources/
│           └── application.yml
├── build.gradle
├── Dockerfile
├── .dockerignore
└── README.md
```

### 파일 작성
```
.dockerignore
Dockerfile
```

### 빌드 및 테스트
```
# 1. Docker 이미지 빌드 (소스에서 직접)
docker buildx build --platform linux/amd64,linux/arm64 -t spring-registry-demo:1.0.0 . --load

# 2. 빌드된 이미지 확인
docker images | grep spring-registry-demo

# 3. 로컬에서 컨테이너 실행 및 테스트
docker run -d -p 8080:8080 --name registry-demo-test spring-registry-demo:1.0.0

# 4. 애플리케이션 동작 확인
echo "애플리케이션 시작 대기 중..."
sleep 15

curl http://localhost:8080/
curl http://localhost:8080/health
curl http://localhost:8080/info

# 5. 테스트 컨테이너 정리
docker stop registry-demo-test
docker rm registry-demo-test
```

### Docker Hub 이미지 배포 
```
# 1. 이미지 태깅 (your-username을 실제 Docker Hub 사용자명으로 변경)
docker tag spring-registry-demo:1.0.0 your-username/spring-registry-demo:1.0.0
docker tag spring-registry-demo:1.0.0 your-username/spring-registry-demo:latest

# 2. 태그 확인
docker images | grep spring-registry-demo

# 3. Docker Hub 로그인 (아직 안했다면)
docker login

# 4. 이미지 푸시
docker push your-username/spring-registry-demo:1.0.0
docker push your-username/spring-registry-demo:latest
```

### 다른 환경에서 이미지 풀
```
# 1. Docker Hub에서 이미지 다운로드
docker pull your-username/spring-registry-demo:latest

# 2. 다운로드된 이미지로 컨테이너 실행
docker run -d -p 8080:8080 --name production-app your-username/spring-registry-demo:latest

# 3. 동작 확인
curl http://localhost:8080/
curl http://localhost:8080/info

# 4. 컨테이너 로그 확인
docker logs production-app

# 5. 정리
docker stop production-app
docker rm production-app
```
41260