package com.example.app.domain.event;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventRepository extends JpaRepository<Event, UUID> {

    @Query("""
           select e
           from Event e
           where e.status = :status
             and e.startTime >= :from
           order by e.startTime asc
           """)
    Page<Event> findUpcoming(@Param("status") EventStatus status,
                             @Param("from") OffsetDateTime from,
                             Pageable pageable);
}
