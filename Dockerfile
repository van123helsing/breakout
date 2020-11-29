
FROM openjdk:8

RUN mkdir /app

WORKDIR /app

ADD ./api/target/spring-boot-starter-parent-1.0.0-SNAPSHOT.jar /app

EXPOSE 8080

CMD ["java", "-jar", "spring-boot-starter-parent-1.0.0-SNAPSHOT.jar"]