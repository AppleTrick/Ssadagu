# 🚀 배포 및 실행 가이드 (Deployment Guide)

이 문서는 프로젝트의 운영(EC2) 환경과 로컬 개발 환경에서의 실행 방법을 설명합니다.

---

## 💻 1. 로컬 개발 환경 (Local Environment)

로컬에서는 **자가 서명 인증서**를 사용하여 HTTPS 환경을 테스트할 수 있도록 분리된 설정을 사용합니다.

### 🛠️ 실행 명령어
프로젝트 루트 디렉토리에서 아래 명령어를 입력하세요.
```bash
docker-compose -f docker-compose.local.yml up -d --build
```

### 🔗 접속 정보
- **메인 서비스**: [https://localhost](https://localhost)
- **Jenkins**: [https://localhost/jenkins](https://localhost/jenkins) (또는 `http://localhost:8081`)
- **Swagger UI**: [https://localhost/swagger-ui/index.html](https://localhost/swagger-ui/index.html)
- **API Docs**: [https://localhost/v3/api-docs](https://localhost/v3/api-docs)

### ⚠️ 주의사항
- **인증서 경고**: 자가 서명 인증서이므로 브라우저에서 "안전하지 않음" 경고가 뜹니다. **[고급] -> [localhost(으)로 이동]**을 클릭하세요.
- **Nginx 재시작**: 설정이 반영되지 않을 경우 아래 명령어를 실행하세요.
  ```bash
  docker-compose -f docker-compose.local.yml restart nginx
  ```

---

## 🌍 2. 운영 환경 (Production / EC2)

운영 환경은 **Let's Encrypt(Certbot)**를 통해 공인 인증서를 자동으로 발급받고 관리합니다.

### 🛠️ 실행 명령어
EC2 서버의 프로젝트 디렉토리에서 실행하세요.
```bash
docker-compose up -d --build
```

### 🔗 접속 정보 (도메인 기반)
- **도메인**: `https://j14a202.p.ssafy.io`
- **Jenkins**: `https://j14a202.p.ssafy.io/jenkins`
- **Swagger UI**: `https://j14a202.p.ssafy.io/swagger-ui/index.html`

### 🏗️ CI/CD (Jenkins)
- **자동 배포**: `dev` 브랜치에 코드가 `push` 되면 Jenkins가 자동으로 빌드 및 배포를 수행합니다.
- **수동 배포**: 필요한 경우 EC2 서버에서 직접 `docker-compose up -d --build`를 실행하여 갱신할 수 있습니다.

---

## 📂 3. 주요 설정 파일
- **`docker-compose.yml`**: 운영 서버 전용 인프라 구성
- **`docker-compose.local.yml`**: 로컬 테스트 전용 인프라 구성
- **`nginx/conf.d/default.conf`**: 운영 서버용 Nginx 설정 (도메인/SSL 기반)
- **`nginx/conf.d/local.conf`**: 로컬용 Nginx 설정 (localhost/자가서명 기반)
- **`Jenkinsfile`**: `dev` 브랜치 자동 배포 파이프라인 정의

---

## 💡 꿀팁
---

## 🧹 4. 시스템 초기화 및 클린 재시작 (Clean Restart)

모든 컨테이너와 이미지를 지우고 완전히 처음부터 다시 빌드하고 싶을 때 사용합니다.

### ⚠️ 주의사항
- **데이터 삭제**: `docker-compose down -v`를 사용하면 Jenkins 설정과 DB 데이터가 모두 날아갑니다. 데이터 보존을 원하면 `-v` 옵션을 빼고 실행하세요.
- **인증서 보존**: 인증서 볼륨을 지우면 SSL 설정을 다시 해야 하므로 주의하세요.

### 🛠️ 실행 순서
```bash
# 1. 모든 컨테이너 중지 및 삭제
docker-compose down

# 2. 프로젝트 관련 이미지 삭제 (혹은 전체 삭제: docker rmi $(docker images -q))
docker rmi $(docker images -q)

# 3. 최신 코드 pull
git pull origin dev

# 4. 재빌드 및 가동
docker-compose up -d --build
```
