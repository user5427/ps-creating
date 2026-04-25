package com.example.app.domain.code;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CodeRepository extends JpaRepository<Code, UUID> {

    @EntityGraph(attributePaths = {"user", "event"})
    @Query("select c from Code c where c.id = :id")
    Optional<Code> findDetailedById(@Param("id") UUID id);
}
