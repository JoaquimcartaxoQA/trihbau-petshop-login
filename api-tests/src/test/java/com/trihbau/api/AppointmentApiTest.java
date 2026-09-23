package com.trihbau.api;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;

class AppointmentApiTest {
    private static final String PASSWORD = "Senha123!";
    private String token;
    private int petId;
    private int appointmentId;

    @BeforeEach
    void createAuthenticatedPet() {
        RestAssured.baseURI = System.getProperty("baseUrl", "http://localhost:3001");
        String email = "appointment-test-" + UUID.randomUUID() + "@example.com";

        Response registerResponse = given()
            .contentType(ContentType.JSON)
            .body(Map.of("name", "Appointment API Tutor", "email", email, "password", PASSWORD))
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(200)
            .extract()
            .response();

        token = registerResponse.path("token");

        petId = given()
            .auth().oauth2(token)
            .contentType(ContentType.JSON)
            .body(Map.of(
                "breed", "Beagle",
                "name", "Bento API",
                "age", 4,
                "weight", 12.5,
                "contactPhone", "85999999999"
            ))
        .when()
            .post("/api/auth/pets")
        .then()
            .statusCode(201)
            .extract()
            .path("id");
    }

    @AfterEach
    void cleanAppointmentData() {
        if (appointmentId > 0) {
            given().auth().oauth2(token).delete("/api/auth/appointments/{id}", appointmentId);
        }
        if (petId > 0) {
            given().auth().oauth2(token).delete("/api/auth/pets/{id}", petId);
        }
    }

    @Test
    void shouldSchedulePetServicesForWhatsAppBooking() {
        Map<String, String> availableBooking = findAvailableBooking();
        String bookingDate = availableBooking.get("date");
        String slotStart = availableBooking.get("slot");
        List<String> services = List.of("Banho", "Tosa completa");

        appointmentId = given()
            .auth().oauth2(token)
            .contentType(ContentType.JSON)
            .body(Map.of(
                "petId", petId,
                "date", bookingDate,
                "slotStart", slotStart,
                "services", services
            ))
        .when()
            .post("/api/auth/appointments")
        .then()
            .statusCode(201)
            .body("petId", equalTo(petId))
            .body("date", equalTo(bookingDate))
            .body("slotStart", equalTo(slotStart))
            .body("service", equalTo("Banho, Tosa completa"))
            .extract()
            .path("id");

        given()
            .auth().oauth2(token)
        .when()
            .get("/api/auth/appointments")
        .then()
            .statusCode(200)
            .body("[0].petName", equalTo("Bento API"))
            .body("[0].petBreed", equalTo("Beagle"))
            .body("[0].date", equalTo(bookingDate))
            .body("[0].slotStart", equalTo(slotStart))
            .body("[0].service", containsString("Banho"))
            .body("[0].service", containsString("Tosa completa"));
    }

    @Test
    void shouldRejectIncompatibleTosaServices() {
        Map<String, String> availableBooking = findAvailableBooking();

        given()
            .auth().oauth2(token)
            .contentType(ContentType.JSON)
            .body(Map.of(
                "petId", petId,
                "date", availableBooking.get("date"),
                "slotStart", availableBooking.get("slot"),
                "services", List.of("Tosa completa", "Tosa higiênica")
            ))
        .when()
            .post("/api/auth/appointments")
        .then()
            .statusCode(400);
    }

    private static LocalDate nextWeekday() {
        LocalDate date = LocalDate.now().plusDays(1);
        while (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            date = date.plusDays(1);
        }
        return date;
    }

    private Map<String, String> findAvailableBooking() {
        LocalDate date = nextWeekday();

        for (int daysChecked = 0; daysChecked < 15; daysChecked++) {
            String dateValue = date.toString();
            Response availability = given()
                .auth().oauth2(token)
            .when()
                .get("/api/auth/appointments/availability?date={date}", dateValue)
            .then()
                .statusCode(200)
                .extract()
                .response();
            String slot = availability.path("find { it.available > 0 }.start");
            if (slot != null) return Map.of("date", dateValue, "slot", slot);
            date = date.plusDays(1);
            while (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                date = date.plusDays(1);
            }
        }

        throw new IllegalStateException("Nenhuma vaga disponível nos próximos dias úteis.");
    }
}
