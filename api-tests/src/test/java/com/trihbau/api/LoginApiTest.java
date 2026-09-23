package com.trihbau.api;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.not;

class LoginApiTest {
    private static final String PASSWORD = "Senha123!";
    private static String email;
    private static String name;

    @BeforeAll
    static void createApiTestUser() {
        RestAssured.baseURI = System.getProperty("baseUrl", "http://localhost:3001");
        name = "API Test Tutor";
        email = "api-test-" + UUID.randomUUID() + "@example.com";

        given()
            .contentType(ContentType.JSON)
            .body(Map.of("name", name, "email", email, "password", PASSWORD))
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(200);
    }

    @Test
    void shouldLoginSuccessfully() {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("email", email, "password", PASSWORD))
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(200)
            .body("name", equalTo(name))
            .body("token", not(blankOrNullString()))
            .body("token", matchesPattern("^[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$"));
    }
}
