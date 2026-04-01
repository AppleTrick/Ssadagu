# 💾 프로젝트 DB 덤프 파일 (최신본) 안내

본 프로젝트의 데이터베이스는 현재 **운영 중인 EC2 서버 내부의 컨테이너**에 구성되어 있습니다.
개발/평가 목적을 위한 기본 스키마는 `ssadagu_dump.sql` 명칭으로 본 `exec` 폴더에 동봉되어 제공됩니다.

## 1. DB 덤프 파일
- **파일명**: `exec/ssadagu_dump.sql`
- **내용**: 시스템 구동에 필요한 테이블(DDL) 및 필수 초기 스키마 정보. (실제 운영 데이터가 포함된 완전한 덤프가 필요한 경우 호스트 서버에서 `mysqldump`를 통해 추출해야 합니다.)

## 2. 수동 복원(Restore) 방법

만약 로컬 또는 다른 서버에 해당 덤프를 적용해야 할 경우 아래 명령어를 참고하세요.

### 🐧 로컬/원격 DB에 직접 복원 (MySQL Client 설치 환경)
```bash
# MySQL 접속 후 데이터베이스 생성
mysql -u root -p
mysql> CREATE DATABASE ssadagu CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
mysql> exit;

# 덤프 파일 적용
mysql -u root -p ssadagu < ./exec/ssadagu_dump.sql
```

### 🐳 Docker 컨테이너 DB에 복원 (로컬 컨테이너 실행 중일 때)
```bash
docker cp ./exec/ssadagu_dump.sql <mysql_container_name>:/tmp/ssadagu_dump.sql
docker exec -it <mysql_container_name> mysql -u root -p ssadagu < /tmp/ssadagu_dump.sql
```

## 3. 유의 사항
- SSAFY 금융망 API 테스트를 위한 계좌(User Account) 정보 및 거래 내역, S3에 업로드된 상품 이미지 링크 등은 모두 연결된 인프라에 의존하므로, 완전한 통합 테스트를 위해서는 `빌드_및_배포.md`에 기재된 환경 변수를 올바르게 설정해야 정상 동작합니다.
