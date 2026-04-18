# Stage 1: Build the Maven project
FROM maven:3.8.7-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Create the final lightweight image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# This copies the generated .jar file from the build stage to the final image
COPY --from=build /app/target/*.jar app.jar

# Set the timezone to Asia/Kolkata for transactional consistency
ENTRYPOINT ["java", "-Duser.timezone=Asia/Kolkata", "-jar", "app.jar"]