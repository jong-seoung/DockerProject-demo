# 쿠버네티스 오토스케일링 전략

## 이론
### 오토스케일링이 필요한 이유 
트래픽은 늘어났다 줄어든다 → 서버 수를 수동으로 관리하면 비효율적 <br>
필요할 때만 Pod를 늘려서 자원 효율 극대화

### HPA
HPA는 Pod 수를 수평으로 늘리거나 줄이는 자동화 도구<br>
기준: CPU 사용량, 메모리, 커스텀 메트릭 등

### HPA와 Rolling Update의 협력
Rolling Update: Deployment Pod을 점진적으로 교체 → 서비스 다운 없이 업데이트<br>
HPA: Pod 수를 자동으로 조절<br>

함께 작동하면
- Rolling Update 중에도 HPA가 부하에 따라 Pod 수를 늘릴 수 있음
- 업데이트된 Pod와 기존 Pod가 동시에 존재 → 트래픽 분산
- 서비스 가용성 유지 + 안정적 스케일링

## 실습
목표
1. HPA 설정으로 CPU 기반 자동 확장 구현
2. 간단한 부하 생성으로 스케일 아웃 확인
3. Rolling Update로 무중단 배포 체험
4. 실시간 모니터링으로 동작 원리 이해

### 애플리케이션 배포
```
# 테스트 앱 배포
kubectl apply -f load-test-app.yaml

# 배포 확인
kubectl get pods -l app=load-test-app
kubectl get svc load-test-service

# Pod 상태 확인
kubectl wait --for=condition=ready pod -l app=load-test-app --timeout=60s
```

### HPA 생성 및 확인
```
# metrics-server 설치
kubectl apply -f metrics-server-minikube.yaml

# HPA 배포
kubectl apply -f hpa.yaml

# HPA 상태 확인
kubectl get hpa
kubectl describe hpa load-test-hpa
```

### 모니터링 설정
#### Mac OS
```
# 터미널 1: HPA와 Pod 실시간 모니터링
watch -n 5 'echo "=== HPA 상태 ===" && kubectl get hpa && echo -e "\n=== Pod 상태 ===" && kubectl get pods -l app=load-test-app'
# Powershell
while ($true) {
    Clear-Host
    Write-Host "=== HPA 상태 ===" -ForegroundColor Green
    kubectl get hpa
    Write-Host "`n=== Pod 상태 ===" -ForegroundColor Green
    kubectl get pods -l app=load-test-app
    Start-Sleep -Seconds 5
}

# 터미널 2: 리소스 사용량 모니터링
watch -n 5 'kubectl top pods -l app=load-test-app'
# Powershell
while ($true) {
    Clear-Host
    Write-Host "=== Pod 리소스 사용량 ===" -ForegroundColor Green
    kubectl top pods -l app=load-test-app
    Start-Sleep -Seconds 5
}

# 터미널 3: 이벤트 모니터링
kubectl get events -w --field-selector involvedObject.kind=HorizontalPodAutoscaler
```

#### Window
```
# 터미널 1: HPA와 Pod 실시간 모니터링 - 5초마다 갱신
while ($true) {
    Clear-Host
    Write-Host "=== HPA 상태 ===" -ForegroundColor Green
    kubectl get hpa
    Write-Host "`n=== Pod 상태 ===" -ForegroundColor Green
    kubectl get pods -l app=load-test-app
    Start-Sleep -Seconds 5
}

# 터미널 2: 리소스 사용량 모니터링
while ($true) {
    Clear-Host
    Write-Host "=== Pod 리소스 사용량 ===" -ForegroundColor Green
    kubectl top pods -l app=load-test-app
    Start-Sleep -Seconds 5
}

# 터미널 3: 이벤트 모니터링
kubectl get events -w --field-selector involvedObject.kind=HorizontalPodAutoscaler
```

### 부하 주기
```
# load-generator 이름을 변경하여 여러 터미널에서 부하 주기 가능
kubectl run load-generator --image=busybox --rm -it --restart=Never -- /bin/sh

# for문 작동
while true; do
  wget -q -O- http://load-test-service/load
  sleep 0.0001
done
```

### 리소스 정리
```
# 리소스 정리
kubectl delete hpa load-test-hpa
kubectl delete -f load-test-app.yaml

# 정리 확인
kubectl get pods
kubectl get hpa
```
