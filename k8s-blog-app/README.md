# ConfigMap과 Secret

## 이론
민감한 정보는 하드코딩하면 안된다는건 다 아는 사실 <br>
그럼, 이걸 어떻게 관리 하냐가 중요함

ConfigMap에는 정보를, Secret에는 민감한 정보를 관리

## 실습

### 프로젝트 구조
```
k8s-blog-app/
├── backend/                 # Node.js Express API
│   ├── app.js
│   ├── package.json
│   └── Dockerfile
├── frontend/               # 정적 웹페이지
│   ├── index.html
│   └── Dockerfile
└── k8s/                    # 쿠버네티스 매니페스트
    ├── configmap.yaml
    ├── secret.yaml
    ├── mysql.yaml
    ├── backend.yaml
    └── frontend.yaml
```