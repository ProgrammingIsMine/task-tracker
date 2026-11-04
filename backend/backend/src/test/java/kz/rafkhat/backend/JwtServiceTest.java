package kz.rafkhat.backend;

import io.jsonwebtoken.JwtException;
import kz.rafkhat.backend.auth.JwtService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-0123456789-0123456789";

    @Test
    void tokenContainsEmail() {
        JwtService service = new JwtService(SECRET, 60_000);
        String token = service.generate("user@test.com");
        assertEquals("user@test.com", service.extractEmail(token));
    }

    @Test
    void tamperedTokenIsRejected() {
        JwtService service = new JwtService(SECRET, 60_000);
        String token = service.generate("user@test.com");
        assertThrows(JwtException.class, () -> service.extractEmail(token + "x"));
    }

    @Test
    void expiredTokenIsRejected() {
        JwtService service = new JwtService(SECRET, -1_000);
        String token = service.generate("user@test.com");
        assertThrows(JwtException.class, () -> service.extractEmail(token));
    }
}
