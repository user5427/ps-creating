package com.example.app.domain.code;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CodeRepository extends JpaRepository<Code, UUID> {

    interface MyTicketEventGroupProjection {
        UUID getEventId();
        String getEventTitle();
        OffsetDateTime getEventStartTime();
        OffsetDateTime getEventEndTime();
        long getTicketQuantity();
    }

    @EntityGraph(attributePaths = {"user", "event"})
    @Query("select c from Code c where c.id = :id")
    Optional<Code> findDetailedById(@Param("id") UUID id);

    @Query(
            value = """
                    select e.id as eventId,
                           e.title as eventTitle,
                           e.startTime as eventStartTime,
                           e.endTime as eventEndTime,
                           count(c.id) as ticketQuantity
                    from Code c
                    join c.event e
                    where c.user.id = :attendeeId
                    group by e.id, e.title, e.startTime, e.endTime
                    order by e.startTime asc
                    """,
            countQuery = """
                    select count(distinct e.id)
                    from Code c
                    join c.event e
                    where c.user.id = :attendeeId
                    """
    )
    Page<MyTicketEventGroupProjection> findTicketGroupsByAttendeeId(@Param("attendeeId") UUID attendeeId,
                                                                     Pageable pageable);

    @EntityGraph(attributePaths = {"user", "event"})
    Page<Code> findByUserIdAndEventIdOrderByCreatedAtAsc(UUID userId, UUID eventId, Pageable pageable);
}
