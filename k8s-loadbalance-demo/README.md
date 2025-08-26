# Deployment와 Service

## 이론

### Deployment 
애플리케이션의 실행 상태를 관리하는 상위 개념 컨트롤러 <br>
주로, ReplicaSet을 생성/관리해서 Pod를 제어
- 원하는 Pod 개수(ReplicaSet)을 보장
- 새로운 버전 배포 시 Rolling Update로 점진적 교체 가능
- 문제가 생기면 RollBack으로 이전 상태로 되돌릴 수 있음

### ReplicaSet
동알한 Pod 복제본을 정해진 개수만큼 항상 유지 <br>
Pod가 죽으면 자동으로 새 Pod를 생성
- Pod의 개수를 보장하는 단순한 역할

### Service
Pod 집합을 안정적으로 접근할 수 있는 네트워크 엔드포인트를 제공 <br>
Pod는 언제든 새로 생성되거나 삭제되기 때문에 IP가 바뀔수 있는데, 이를 해결
- 라벨 셀렉터로 Pod를 선택해 연결
- 로드 벨런싱을 제공
- Pod의 IP가 바뀌어도 항상 고정된 DNS이름 / ClusterIP를 제공


## 실습
### 배포 및 확인
```
# 1. 애플리케이션 배포
kubectl apply -f webapp-deployment.yaml

# 2. 배포 상태 확인
kubectl get deployments
kubectl get pods -o wide

# 3. Service 확인
kubectl get services

# 4. 각 Pod의 세부 정보 확인
kubectl describe pods -l app=webapp

# 5. 포트포워딩 -> http://localhost:8080/에서 확인해 보기
kubectl port-forward service/webapp-service 8080:80
# 이후 웹 사이트 새로고침하면 색이 변하는걸 확인할 수 있음 
```

### 로드 밸런싱 확인
```
# 1. 테스트용 컬을 동작해서 내부로 진입
kubectl run curl-test --image=curlimages/curl -it --rm -- sh

# 1-1. 만약 있다면 아래 명령어를 이용하여 진입
kubectl run curl-test

# 2. 색 확인 
curl -s webapp-service | grep -E "Pod 이름.*highlight"
```

### 스케일링으로 로드벨런싱 확인
```
# 증가
## 1. Pod를 5개로 증가
kubectl scale deployment webapp-deployment --replicas=5

## 2. 새로운 Pod 생성 확인
kubectl get pods -l app=webapp

# 감소
## 1. Pod를 2개로 감소
kubectl scale deployment webapp-deployment --replicas=2

## 2. Pod 삭제 과정 확인
kubectl get pods -l app=webapp
```

### 실습 종료
```
# 포트 포워딩 중지 (Ctrl+C)

# 모든 리소스 삭제
kubectl delete deployment webapp-deployment
kubectl delete service webapp-service
kubectl delete pod curl-test

# 정리 확인
kubectl get all
```

