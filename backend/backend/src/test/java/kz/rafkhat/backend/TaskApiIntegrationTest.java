package kz.rafkhat.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class TaskApiIntegrationTest {

    @Value("${local.server.port}")
    private int port;

    private final HttpClient client = HttpClient.newHttpClient();

    private HttpResponse<String> send(String method, String path, String body, String token)
            throws Exception {
        HttpRequest.Builder builder = HttpRequest
                .newBuilder(URI.create("http://localhost:" + port + path))
                .header("Content-Type", "application/json");
        if (token != null) {
            builder.header("Authorization", "Bearer " + token);
        }
        builder.method(method, body == null
                ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body));
        return client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    private String find(String regex, String text) {
        Matcher matcher = Pattern.compile(regex).matcher(text);
        assertTrue(matcher.find(), "pattern not found: " + regex + " in " + text);
        return matcher.group(1);
    }

    private String register(String email) throws Exception {
        HttpResponse<String> res = send("POST", "/api/auth/register",
                "{\"email\":\"" + email + "\",\"password\":\"123456\"}", null);
        assertEquals(201, res.statusCode());
        return find("\"token\":\"([^\"]+)\"", res.body());
    }

    private String newUserToken() throws Exception {
        return register("user-" + UUID.randomUUID() + "@test.com");
    }

    @Test
    void tasksRequireAuthentication() throws Exception {
        assertEquals(401, send("GET", "/api/tasks", null, null).statusCode());
    }

    @Test
    void duplicateEmailIsRejected() throws Exception {
        String email = "dup-" + UUID.randomUUID() + "@test.com";
        register(email);
        HttpResponse<String> res = send("POST", "/api/auth/register",
                "{\"email\":\"" + email + "\",\"password\":\"123456\"}", null);
        assertEquals(409, res.statusCode());
    }

    @Test
    void wrongPasswordIsRejected() throws Exception {
        String email = "login-" + UUID.randomUUID() + "@test.com";
        register(email);
        HttpResponse<String> res = send("POST", "/api/auth/login",
                "{\"email\":\"" + email + "\",\"password\":\"wrong-password\"}", null);
        assertEquals(401, res.statusCode());
    }

    @Test
    void createdTaskAppearsInList() throws Exception {
        String token = newUserToken();
        HttpResponse<String> created = send("POST", "/api/tasks", "{\"title\":\"Write tests\"}", token);
        assertEquals(201, created.statusCode());
        assertTrue(created.body().contains("\"status\":\"TODO\""));

        HttpResponse<String> list = send("GET", "/api/tasks", null, token);
        assertEquals(200, list.statusCode());
        assertTrue(list.body().contains("Write tests"));
    }

    @Test
    void emptyTitleIsRejected() throws Exception {
        String token = newUserToken();
        assertEquals(400, send("POST", "/api/tasks", "{\"title\":\"\"}", token).statusCode());
    }

    @Test
    void taskStatusCanBeChanged() throws Exception {
        String token = newUserToken();
        HttpResponse<String> created = send("POST", "/api/tasks", "{\"title\":\"Move me\"}", token);
        String id = find("\"id\":(\\d+)", created.body());

        HttpResponse<String> moved = send("PATCH", "/api/tasks/" + id, "{\"status\":\"DONE\"}", token);
        assertEquals(200, moved.statusCode());
        assertTrue(moved.body().contains("\"status\":\"DONE\""));
    }

    @Test
    void usersCannotSeeOrChangeEachOthersTasks() throws Exception {
        String owner = newUserToken();
        String stranger = newUserToken();
        HttpResponse<String> created = send("POST", "/api/tasks", "{\"title\":\"Private task\"}", owner);
        String id = find("\"id\":(\\d+)", created.body());

        HttpResponse<String> strangerList = send("GET", "/api/tasks", null, stranger);
        assertFalse(strangerList.body().contains("Private task"));
        assertEquals(404, send("PATCH", "/api/tasks/" + id, "{\"status\":\"DONE\"}", stranger).statusCode());
        assertEquals(404, send("DELETE", "/api/tasks/" + id, null, stranger).statusCode());
    }
}