package com.example.app.web;

import com.example.app.domain.user.Role;
import com.example.app.domain.user.User;
import com.example.app.domain.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Dev-only auth shim: reads the acting user's id from the {@code X-Actor-Id} header,
 * looks them up, populates {@link ActorContext}. Falls back to the seeded organizer
 * in the {@code dev} profile. Real Spring Security replaces this later.
 */
@Component
public class ActorInterceptor implements HandlerInterceptor {

    public static final String HEADER = "X-Actor-Id";

    private final ActorContext actorContext;
    private final UserRepository userRepository;
    private final UUID devFallbackOrganizerId;

    public ActorInterceptor(ActorContext actorContext,
                            UserRepository userRepository,
                            @Value("${app.dev.organizer-id:00000000-0000-0000-0000-000000000001}")
                            UUID devFallbackOrganizerId) {
        this.actorContext = actorContext;
        this.userRepository = userRepository;
        this.devFallbackOrganizerId = devFallbackOrganizerId;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String header = request.getHeader(HEADER);
        UUID actorId = devFallbackOrganizerId;
        if (header != null && !header.isBlank()) {
            try {
                actorId = UUID.fromString(header.trim());
            } catch (IllegalArgumentException ignored) {
                // Fall through to dev fallback.
            }
        }

        Role role = userRepository.findById(actorId)
                .map(User::getRole)
                .orElse(Role.ATTENDEE);

        actorContext.set(actorId, role);
        return true;
    }
}
