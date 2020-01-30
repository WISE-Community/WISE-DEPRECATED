package org.wise.portal.score.repository;

import org.wise.portal.score.domain.Timer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TimerRespository extends JpaRepository<Timer, Long> {
}
