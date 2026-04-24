package com.example.app.web;

import com.example.app.domain.user.Role;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

/**
 * Holds the acting user's id + role for a single HTTP request.
 * Populated by {@link ActorInterceptor} from the X-Actor-Id header.
 *
 * Demonstrates quality requirement #1 (concurrency / stateless): use-case data
 * lives at request scope only — nothing in session.
 */
@Component
@RequestScope
public class ActorContext {

    private UUID actorId;
    private Role role;

    public UUID getActorId() { return actorId; }
    public Role getRole() { return role; }

    public void set(UUID actorId, Role role) {
        this.actorId = actorId;
        this.role = role;
    }

    public boolean isOrganizer() {
        return role == Role.ORGANIZER;
    }
}
