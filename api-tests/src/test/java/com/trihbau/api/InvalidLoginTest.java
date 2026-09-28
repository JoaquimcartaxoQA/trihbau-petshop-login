package com.trihbau.api;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;


class InvalidLoginTest {
    @BeforeEach 
    void setUp() {
        RestAssured.baseURI = System.getProperty("baseUrl", "http://localhost:3001");
    }

    
    @Test
    void shouldFailLoginWithInvalidCredentials() {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("email","teste-teste.com.br", "password","123@teste"))
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(401)
            .body("error", equalTo("Credenciais inválidas."));
    
    }

    @Test
    void shouldFailLoginWithoutDomainExtension() {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("email","teste@teste", "password","123@teste"))
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(401)
            .body("error", equalTo("Credenciais inválidas."));
    
    }

    @Test
    void shouldFailLoginWithInvalidPassword() {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("email","teste@teste.com.br", "password","123teste"))
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(401)
            .body("error", equalTo("Credenciais inválidas."));
    
    }

    @Test
    void shouldFailLoginWithoutPassword() {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("email","teste@teste.com.br", "password",""))
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(401)
            .body("error", equalTo("Credenciais inválidas."));
    
    }

}