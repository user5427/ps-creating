package com.example.app.config;

import com.example.app.domain.event.Event;
import com.example.app.domain.event.EventRepository;
import com.example.app.domain.event.EventStatus;
import com.example.app.domain.user.Role;
import com.example.app.domain.user.User;
import com.example.app.domain.user.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds development data on startup: one organizer, one attendee, and a handful
 * of events spanning categories and statuses (including one sold-out and one
 * free event) so all UI states can be demonstrated.
 */
@Component
@Profile("dev")
public class DevSeedRunner implements CommandLineRunner {

        private static final Logger log = LoggerFactory.getLogger(DevSeedRunner.class);

        private final UserRepository userRepository;
        private final EventRepository eventRepository;
        private final UUID organizerId;
        private final UUID attendeeId;

        @PersistenceContext
        private EntityManager entityManager;

        public DevSeedRunner(UserRepository userRepository,
                        EventRepository eventRepository,
                        @Value("${app.dev.organizer-id}") UUID organizerId,
                        @Value("${app.dev.attendee-id}") UUID attendeeId) {
                this.userRepository = userRepository;
                this.eventRepository = eventRepository;
                this.organizerId = organizerId;
                this.attendeeId = attendeeId;
        }

        @Override
        @Transactional
        public void run(String... args) {
                seedUsers();
                seedEvents();
        }

        private void seedUsers() {
                // Use EntityManager.persist() directly: with a pre-assigned UUID,
                // Spring Data's save() would call merge() and then choke because the
                // @Version field is null on a "detached-looking" entity.
                if (userRepository.findById(Objects.requireNonNull(organizerId)).isEmpty()) {
                        entityManager.persist(new User(organizerId, "organizer@demo.test", "Tomas", "Žilinskas", null,
                                        Role.ORGANIZER));
                        log.info("Seeded organizer {}", organizerId);
                }
                if (userRepository.findById(Objects.requireNonNull(attendeeId)).isEmpty()) {
                        entityManager.persist(new User(attendeeId, "attendee@demo.test", "Eglė", "Kazlauskaitė",
                                        "+15555550123", Role.ATTENDEE));
                        log.info("Seeded attendee {}", attendeeId);
                }
        }

        private void seedEvents() {
                if (eventRepository.count() > 0) {
                        return;
                }

                OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

                List<Event> samples = List.of(
                                buildEvent("Vilnius Jazz Night",
                                                "A curated evening of live jazz with local and international acts.",
                                                "Music", "Loftas, Vilnius",
                                                "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200",
                                                now.plusDays(7), 4, new BigDecimal("19.99"), 200, 0),
                                buildEvent("Frontend Architecture Meetup",
                                                "Lightning talks from React, Svelte, and Qwik engineers.",
                                                "Tech", "MIF VU, Naugarduko 24",
                                                "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200",
                                                now.plusDays(12), 3, new BigDecimal("0.00"), 120, 45),
                                buildEvent("Techno Open Air",
                                                "Outdoor techno festival with six international headliners.",
                                                "Music", "Vingis Park",
                                                "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200",
                                                now.plusDays(21), 8, new BigDecimal("59.00"), 2000, 2000), // sold out
                                buildEvent("Startup Pitch Day",
                                                "Ten early-stage startups pitch to angel investors and the public.",
                                                "Tech", "Tech Park Vilnius",
                                                "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200",
                                                now.plusDays(18), 5, new BigDecimal("9.00"), 300, 27),
                                buildEvent("Kaunas Film Festival Opening", "Opening night gala with the director Q&A.",
                                                "Film", "Romuva Cinema, Kaunas",
                                                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",
                                                now.plusDays(30), 4, new BigDecimal("14.50"), 400, 180),
                                buildEvent("Baltic Design Forum", "Two days of talks on Nordic-Baltic product design.",
                                                "Design", "LTMC, Klaipėda",
                                                "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200",
                                                now.plusDays(45), 16, new BigDecimal("79.00"), 500, 120),
                                buildEvent("Stand-Up Comedy Open Mic",
                                                "Five minutes, five laughs — or you owe the bar a round.",
                                                "Comedy", "Paviljonas, Vilnius",
                                                "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200",
                                                now.plusDays(4), 3, new BigDecimal("5.00"), 80, 22),
                                buildEvent("Saturday Morning Parkrun", "Weekly 5km community run — free to all, timed.",
                                                "Sports", "Vingis Park start line",
                                                "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200",
                                                now.plusDays(2), 1, new BigDecimal("0.00"), 500, 210),
                                buildEvent("Opera at the Palace",
                                                "An evening of arias from Verdi, Puccini, and Wagner.",
                                                "Classical", "LNOBT, Vilnius",
                                                "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200",
                                                now.plusDays(60), 3, new BigDecimal("45.00"), 800, 90));

                eventRepository.saveAll(Objects.requireNonNull(samples));
                log.info("Seeded {} demo events", samples.size());
        }

        private Event buildEvent(String title, String description, String category, String venue,
                        String imageUrl, OffsetDateTime start, int hoursLong,
                        BigDecimal price, int capacity, int seatsSold) {
                Event event = new Event(title, description, category, venue, imageUrl,
                                start, start.plusHours(hoursLong), capacity, price, organizerId);
                event.setSeatsSold(seatsSold);
                event.setStatus(EventStatus.PUBLISHED);
                return event;
        }
}
