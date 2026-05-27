package com.example.app.domain.event;

import jakarta.persistence.LockModeType;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventRepository extends JpaRepository<Event, UUID>, JpaSpecificationExecutor<Event> {

    @Query("""
           select distinct e.category
           from Event e
           where e.status = :status
             and e.startTime >= :from
           order by e.category asc
           """)
    List<String> findUpcomingCategories(@Param("status") EventStatus status,
                                        @Param("from") OffsetDateTime from);

    @Query("""
           select e
           from Event e
           where e.organizerId = :organizerId
           order by e.startTime desc
           """)
    Page<Event> findByOrganizerId(@Param("organizerId") UUID organizerId,
                                  Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Event e where e.id = :id")
    Optional<Event> findByIdForUpdate(@Param("id") UUID id);
}
