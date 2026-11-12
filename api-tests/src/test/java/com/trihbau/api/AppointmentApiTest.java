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
    void shouldReleaseSlotWhenPetIsDeleted() {
        Map<String, String> availableBooking = findAvailableBooking();
        String bookingDate = availableBooking.get("date");
        String slotStart = availableBooking.get("slot");
        int availableBefore = availableSlots(bookingDate, slotStart);

        appointmentId = given()
            .auth().oauth2(token)
            .contentType(ContentType.JSON)
            .body(Map.of(
                "petId", petId,
                "date", bookingDate,
                "slotStart", slotStart,
                "services", List.of("Banho")
            ))
        .when()
            .post("/api/auth/appointments")
        .then()
            .statusCode(201)
            .extract().path("id");

        given().auth().oauth2(token).when().delete("/api/auth/pets/{id}", petId)
            .then().statusCode(204);
        petId = 0;
        appointmentId = 0;

        given().auth().oauth2(token)
            .when().get("/api/auth/appointments/availability?date={date}", bookingDate)
            .then()
            .statusCode(200)
            .body(String.format("find { it.start == '%s' }.available", slotStart), equalTo(availableBefore));
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

    @Test
    void rejectsFebruaryOverflowThatWouldNormalizeToAWeekday() {
        int year = LocalDate.now().getYear() + 1;
        while (LocalDate.of(year, 2, 1).plusDays(29).getDayOfWeek().getValue() > 5) year++;
        given().auth().oauth2(token).contentType(ContentType.JSON)
            .body(Map.of("petId", petId, "date", year + "-02-30", "slotStart", "08:00",
                         "services", List.of("Banho")))
            .when().post("/api/auth/appointments").then().statusCode(400);
    }

    @Test
    void capacityConflictDoesNotOverbookAndCancellationRestoresTheSlot() {
        String date = nextWeekday().plusWeeks(2).toString();
        for (int i = 0; i < 2; i++) {
            appointmentId = given().auth().oauth2(token).contentType(ContentType.JSON)
                .body(Map.of("petId", petId, "date", date, "slotStart", "18:00", "services", List.of("Banho")))
                .when().post("/api/auth/appointments").then().statusCode(201).extract().path("id");
        }
        given().auth().oauth2(token).contentType(ContentType.JSON)
            .body(Map.of("petId", petId, "date", date, "slotStart", "18:00", "services", List.of("Banho")))
            .when().post("/api/auth/appointments").then().statusCode(409);
        org.junit.jupiter.api.Assertions.assertEquals(0, availableSlots(date, "18:00"));
        given().auth().oauth2(token).delete("/api/auth/appointments/{id}", appointmentId).then().statusCode(204);
        org.junit.jupiter.api.Assertions.assertEquals(1, availableSlots(date, "18:00"));
    }

    @Test
    void anotherTutorCannotEditOrDeletePetsOrAppointments() {
        var booking = findAvailableBooking();
        appointmentId = given().auth().oauth2(token).contentType(ContentType.JSON)
            .body(Map.of("petId", petId, "date", booking.get("date"), "slotStart", booking.get("slot"), "services", List.of("Banho")))
            .when().post("/api/auth/appointments").then().statusCode(201).extract().path("id");
        String outsider = given().contentType(ContentType.JSON)
            .body(Map.of("name", "Other synthetic tutor", "email", UUID.randomUUID() + "@example.test", "password", PASSWORD))
            .when().post("/api/auth/register").then().statusCode(200).extract().path("token");
        var pet = Map.of("breed", "Beagle", "name", "Changed", "age", 5, "weight", 12, "contactPhone", "85999999999");
        given().auth().oauth2(outsider).contentType(ContentType.JSON).body(pet)
            .put("/api/auth/pets/{id}", petId).then().statusCode(404);
        given().auth().oauth2(outsider).delete("/api/auth/pets/{id}", petId).then().statusCode(404);
        given().auth().oauth2(outsider).contentType(ContentType.JSON).body(Map.of("services", List.of("Banho")))
            .put("/api/auth/appointments/{id}", appointmentId).then().statusCode(404);
        given().auth().oauth2(outsider).delete("/api/auth/appointments/{id}", appointmentId).then().statusCode(404);
        given().auth().oauth2(token).contentType(ContentType.JSON).body(pet)
            .put("/api/auth/pets/{id}", petId).then().statusCode(200).body("name", equalTo("Changed"));
        given().auth().oauth2(token).contentType(ContentType.JSON).body(Map.of("services", List.of("Corte de unhas")))
            .put("/api/auth/appointments/{id}", appointmentId).then().statusCode(200).body("service", equalTo("Corte de unhas"));
    }

    @Test
    void rejectsMalformedIdentifiersAndInvalidBookingInputs() {
        String date = nextWeekday().toString();
        for (var input : List.of(
                Map.of("petId", "invalid", "date", date, "slotStart", "08:00", "services", List.of("Banho")),
                Map.of("petId", petId, "date", "bad", "slotStart", "08:00", "services", List.of("Banho")),
                Map.of("petId", petId, "date", date, "slotStart", "04:00", "services", List.of("Banho")),
                Map.of("petId", petId, "date", "2000-01-03", "slotStart", "08:00", "services", List.of("Banho")),
                Map.of("petId", petId, "date", date, "slotStart", "08:00", "services", List.of()),
                Map.of("petId", petId, "date", date, "slotStart", "08:00", "services", List.of("Unknown")))) {
            given().auth().oauth2(token).contentType(ContentType.JSON).body(input)
                .post("/api/auth/appointments").then().statusCode(400);
        }
        for (String path : List.of("/api/auth/pets/invalid", "/api/auth/appointments/invalid")) {
            given().auth().oauth2(token).delete(path).then().statusCode(400);
        }
        given().auth().oauth2(token).get("/api/auth/appointments/availability").then().statusCode(400);
        given().auth().oauth2(token).queryParam("date", "2000-01-01").get("/api/auth/appointments/availability").then().statusCode(400);
        given().auth().oauth2(token).queryParam("date", "2000-01-03").get("/api/auth/appointments/availability").then().statusCode(400);
        given().auth().oauth2(token).contentType(ContentType.JSON).body(Map.of("services", List.of()))
            .put("/api/auth/appointments/1").then().statusCode(400);
    }

    private static LocalDate nextWeekday() {
        LocalDate date = LocalDate.now().plusDays(1);
        while (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            date = date.plusDays(1);
        }
        return date;
    }

    private int availableSlots(String date, String slotStart) {
        return given().auth().oauth2(token)
            .when().get("/api/auth/appointments/availability?date={date}", date)
            .then().statusCode(200)
            .extract().path(String.format("find { it.start == '%s' }.available", slotStart));
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
