package com.example.app.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CodeQrUtils {

    private static final String PREFIX = "app-qr-v1";
    private static final String HMAC = "HmacSHA256";

    private final byte[] secret;

    public CodeQrUtils(@Value("${app.qr.secret:dev-qr-secret-change-me}") String secret) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
    }

    public String createPayload(UUID codeId) {
        String data = PREFIX + ":" + codeId;
        String sig = sign(data);
        return data + ":" + sig;
    }

    public Optional<UUID> extractCodeId(String payload) {
        if (payload == null || payload.isBlank()) {
            return Optional.empty();
        }

        String[] parts = payload.trim().split(":");
        if (parts.length != 3) {
            return Optional.empty();
        }
        if (!PREFIX.equals(parts[0])) {
            return Optional.empty();
        }

        UUID codeId;
        try {
            codeId = UUID.fromString(parts[1]);
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }

        String signedData = parts[0] + ":" + parts[1];
        String expectedSig = sign(signedData);
        byte[] provided = parts[2].getBytes(StandardCharsets.UTF_8);
        byte[] expected = expectedSig.getBytes(StandardCharsets.UTF_8);
        if (!MessageDigest.isEqual(provided, expected)) {
            return Optional.empty();
        }

        return Optional.of(codeId);
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC);
            mac.init(new SecretKeySpec(secret, HMAC));
            byte[] digest = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to sign QR payload", ex);
        }
    }
}
