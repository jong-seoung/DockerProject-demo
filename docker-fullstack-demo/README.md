# Docker Compose & Multi-Container
> React + Spring Boot + MySQL을 Docker Compose로 통합 실행하여 실무 환경과 유사한 전체 스택 애플리케이션을 구축

## 기본 YAML 구조 - 예시
```
version: "3.8"  # Compose 파일 버전

services:               #실행할 컨테이너들 정의하는 핵심 섹션
  web:                      # 웹 서버 서비스
    image: nginx                   # 사용할 Docker 이미지
    ports:                         
      - "80:80"                    # 호스트 80번 → 컨테이너 80번
    environment:                   
      - ENV=production             # 환경변수 설정
    volumes:                       
      - ./app:/app                  # 호스트 ./app → 컨테이너 /app
    depends_on:                    
      - database                    # database 서비스 먼저 실행
    networks:                      
      - app_network                 # 연결할 네트워크

  database:                 # 데이터베이스 서비스
    image: mysql:8.0               # MySQL 이미지 사용
    environment:                   
      - MYSQL_ROOT_PASSWORD=secret # MySQL root 패스워드 설정
    volumes:                       
      - db_data:/var/lib/mysql      # 데이터 영구 저장
    networks:                      
      - app_network                 # 연결할 네트워크
    restart: unless-stopped         # 컨테이너 재시작 정책

volumes:
  db_data:                  # 데이터 저장용 볼륨 정의

networks:
  app_network:              # 서비스 간 통신용 네트워크 정의

```

## 의존성 설정 방법
```
services:
  backend:
    build: ./backend
    depends_on:
      mysql:
        condition: service_healthy    # 헬스체크 통과 후 시작

  mysql:
    image: mysql:8.0
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      interval: 10s
      retries: 5
      start_period: 30s

```
- **의존성 관리 (`depends_on`)**
    - `backend` 서비스가 `mysql` 서비스에 의존한다고 설정
    - `condition: service_healthy` = MySQL이 정상 동작할 때까지 기다린 후 backend 시작
- **헬스체크 (`healthcheck`)**
    MySQL이 실제로 준비됐는지 확인하는 검사:
    - **`test`**: `mysqladmin ping` 명령으로 MySQL 연결 테스트
    - **`interval: 10s`**: 10초마다 체크
    - **`timeout: 20s`**: 각 체크는 20초 내에 완료되어야 함
    - **`retries: 5`**: 5번까지 실패 허용
    - **`start_period: 30s`**: 처음 30초는 실패해도 카운트 안함 (초기화 시간)

backend가 먼저 시작되면 연결 에러가 발생, 헬스체크로 MySQL이 완전히 준비된 후에 backend를 시작

## 네트워크와 서비스 디스커버리
Docker Compose는 자동으로 기본 네트워크를 만든다. (myapp_default)

서비스명을 활영하여 접근이 가능하다.
- web 서비스 → `http://web` 주소로 접근 가능
- api 서비스 → `http://api` 주소로 접근 가능

실제 사용 예시
```
services:
  frontend:
    image: nginx
    # API 호출시: http://backend:3000

  backend:
    image: node:18
    # DB 연결시: mysql://database:3306

  database:
    image: mysql:8.0
```

frontend 컨테이너에 대해서만 설명
```
image: nginx → Nginx 서버 이미지를 사용
주석에 http://backend:3000라고 되어 있는 이유:
같은 Compose 네트워크 안에서는 컨테이너 이름이 호스트 이름처럼 사용 가능
즉, frontend에서 backend API를 호출할 때 http://localhost:3000이 아니라
http://backend:3000으로 접근 가능
```

## 네트워크 분리 전략
민감한 서비스(DB, 캐시, 내부 API 등)를 외부나 불필요한 컨테이너에서 접근하지 못하게 보호하기 위해 적용

```
version: "3.8"

services:
  # MySQL 서비스
  mysql:
    ...
    networks:
      - back-db-network
    ...

  # 백엔드 서비스
  backend:
    ...
    networks:
      - front-back-network  # frontend와 통신 가능
      - back-db-network   # db와 통신 가능
    ...

  # 프론트엔드 서비스
  frontend:
    ...
    networks:
      - front-back-network  # 외부 접속용, backend와 연결 가능
    ...

networks:
  front-back-network:
    driver: bridge
  back-db-network:
    driver: bridge
    internal: true 
```
- front-back-network: front back이랑 통신하는 네트워크 <br>
- back-db-network: back db(internal)로 구축되어 통신하는 네트워크 <br>
    - internal을 주면 외부에서 접근이 불가능하다

## 실습 과정
### 전체 어플리케이션 실행
```
# Docker Compose로 전체 서비스 시작
docker-compose up -d

# 실행 중인 컨테이너 확인
docker-compose ps

# 로그 확인
docker-compose logs -f          # 전체 로그
docker-compose logs mysql       # MySQL 로그
docker-compose logs backend     # 백엔드 로그
docker-compose logs frontend    # 프론트엔드 로그

# curl 보내기
curl http://localhost:3000                      # 프론트엔드 접속
curl http://localhost:8080/api/posts/health     # 백엔드 API 상태 확인
curl http://localhost:8080/api/posts            # 게시글 목록 조회
```

### 네트워크 및 볼륨 확인
```
# 생성된 네트워크 목록
docker network ls

# docker-fullstack-demo_back-db-network 상세 정보
docker network inspect docker-fullstack-demo_back-db-network

# 볼륨 목록
docker volume ls

# MySQL 볼륨 상세 정보
docker volume inspect docker-fullstack-demo_blog_mysql_data
```

### 성능 모니터링
```
# 전체 컨테이너 리소스 사용량
docker stats

# 특정 컨테이너만
docker stats blog-mysql blog-backend blog-frontend

# 네트워크 트래픽 확인
docker exec blog-backend netstat -i
```

### 실습 정리
```
docker-compose down                 # Compose로 띄운 컨테이너와 네트워크를 종료하고 삭제합니다.
docker-compose down --rmi all -v    # docker-compose down의 확장 버전으로, 컨테이너/네트워크 삭제 + 이미지/볼륨 삭제
```
