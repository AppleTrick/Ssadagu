# Build stage
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy gradle files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Grant execute permission for gradlew
RUN chmod +x gradlew

# Build the application
COPY src src
RUN ./gradlew bootJar --no-daemon

# Final stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the build artifact from the build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose the internal port
EXPOSE 8080

# Copy environment variables if they exist
COPY .env* .env

# Run the application (Natively import .env as a property source)
ENTRYPOINT ["java", "-Dspring.config.import=optional:file:.env", "-jar", "app.jar"]
