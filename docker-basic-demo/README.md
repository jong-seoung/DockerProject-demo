# MySQL + Node.js API 연동

## 프로젝트 구조
```
docker-basic-demo/
├── api/
│   ├── package.json
│   ├── server.js
│   └── Dockerfile
└── database/
    └── init.sql
```

- database/init.sql - Mysql 초기화 스크립트
- api/package.json - Node.js 의존성 설정
- api/server.js - Express API 서버
- api/Dockerfile - API 컨테이너 이미지 설정

## 실습 과정

### Mysql 컨테이너 실행
```
# MySQL 볼륨 생성
docker volume create mysql-data

# 볼륨 확인
docker volume ls

# MySQL 컨테이너 실행 

## (Mac OS)
docker run -d \
  --name blog-mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=simple_blog \
  -p 3306:3306 \
  -v mysql-data:/var/lib/mysql \
  -v $(pwd)/database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro \
  mysql:8.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci \
  --default-time-zone='+09:00'

## (Window)
docker run -d `
  --name blog-mysql `
  -e MYSQL_ROOT_PASSWORD=secret `
  -e MYSQL_DATABASE=simple_blog `
  -p 3306:3306 `
  -v mysql-data:/var/lib/mysql `
  -v "${PWD}\database\init.sql:/docker-entrypoint-initdb.d/init.sql:ro" `
  mysql:8.0 `
  --character-set-server=utf8mb4 `
  --collation-server=utf8mb4_unicode_ci `
  --default-time-zone='+09:00'

## 만약 MysqlWorkbench가 설치되어서 자동으로 실행되고 있다면 종료해주고 시작 (관리자 권한 필요)
net stop MySQL80
docker start blog-mysql

# 컨테이너 로그 확인
docker logs blog-mysql
```

### API 서버 빌드 및 실행
```
# API 서버 이미지 빌드
cd api
docekr build -t simple-blog-api .

# API 서버 컨테이너 실행

## (Mac OS)
docker run -d \
  --name blog-api \
  -e DB_HOST=blog-mysql \
  -e DB_PASSWORD=secret \
  -e DB_NAME=simple_blog \
  -p 3000:3000 \
  --link blog-mysql \
  simple-blog-api

## (Window)
docker run -d `
  --name blog-api `
  -e DB_HOST=blog-mysql `
  -e DB_PASSWORD=secret `
  -e DB_NAME=simple_blog `
  -p 3000:3000 `
  --link blog-mysql `
  simple-blog-api
```

### 동작 확인
```
# 최상위로 이동
cd ..

docker ps

# api 테스트
curl http://localhost:3000/health
curl http://localhost:3000/posts

# POST 요청
## (Mac OS)
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Docker 실습", "content":"포트 바인딩과 볼륨을 배웠습니다."}'

## (Window)
Invoke-RestMethod -Uri "http://localhost:3000/posts" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body '{"title":"Docker 실습", "content":"포트 바인딩과 볼륨을 배웠습니다."}'
```
서버 재 시작 이후, 데이터를 확인해봐도 남이 있음

### 네트워크와 볼륨 상태 확인
```
docker volume ls

# 상세 정보
docker volume inspect mysql-data

# 네트워크 정보 확인
## (Mac OS)
docker inspect blog-mysql | grep -A 10 "NetworkSettings"
docker inspect blog-api | grep -A 10 "NetworkSettings"

## (Window)
docker inspect blog-mysql | Select-String "NetworkSettings" -Context 0,10
docker inspect blog-api | Select-String "NetworkSettings" -Context 0,10
```

### 실습 환경 정리
```
# 컨테이너 중지 및 삭제
docker stop blog-api blog-mysql
docker rm blog-api blog-mysql

# 이미지 삭제
docker rmi simple-blog-api

# 볼륨 확인 (데이터는 여전히 남아있음)
docker volume ls

# 볼륨까지 삭제하려면
docker volume rm mysql-data
```

## 핵심 

### 포트 바인딩 (p)
컨테이너 내부 서비스를 호스트에서 접근 가능하게 만듭니다.  
- **형식**: `-p [호스트포트]:[컨테이너포트]`
- **예시**:
  ```bash
  -p 3000:3000   # 호스트 3000번 → 컨테이너 3000번

### 볼륨 마운트 (v)
데이터를 컨테이너 외부(호스트)에 영구 저장합니다.
- **형식**: -v [호스트경로 or 볼륨명]:[컨테이너경로]
- **예시**:
  ```bash
  -v mysql-data:/var/lib/mysql

### 컨테이너 연결 -link
컨테이너 간 네트워크 통신 활성화 <br>
- **형식**: --link [대상컨테이너명]
- **예시**:
  ```bash
  --link <대상컨테이너명>

### 환경변수 (e)
컨테이너 실행 시 설정값 전달 <br>
- **형식**: -e [변수명=값]
- **예시**:
  ```bash
  -e DB_HOST=blog-mysql