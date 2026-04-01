# 1. 빌드 스테이지 (JDK 21)
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# 모든 소스 복사 (json, sql 포함)
COPY . .

# 빌드 실행
RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test

# 2. 실행 스테이지 (JRE 21)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# 빌드 결과물 jar 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 루트에 있는 설정 파일들도 실행 위치로 복사 (JSON, SQL 등)
COPY --from=build /app/schema.sql ./schema.sql
COPY --from=build /app/SSAFY_금융망_API_명세_파싱.json ./SSAFY_금융망_API_명세_파싱.json

# 앱 실행
ENTRYPOINT ["java", "-Duser.timezone=Asia/Seoul", "-jar", "app.jar"]
