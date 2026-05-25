package com.bibliacatolica.api.infrastructure.adapter.out.persistence;

import com.bibliacatolica.api.domain.port.out.UserTrialRepositoryPort;
import com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity.UserTrialEntity;
import com.bibliacatolica.api.infrastructure.adapter.out.persistence.repository.JpaUserTrialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserTrialRepositoryAdapter implements UserTrialRepositoryPort {

    private final JpaUserTrialRepository jpaRepository;

    @Override
    public Optional<LocalDateTime> findTrialStartDateByEmail(String email) {
        return jpaRepository.findByEmail(email)
                .map(UserTrialEntity::getTrialStartDate);
    }

    @Override
    public void saveTrialStart(String email, LocalDateTime startDate) {
        if (jpaRepository.findByEmail(email).isEmpty()) {
            UserTrialEntity entity = UserTrialEntity.builder()
                    .email(email)
                    .trialStartDate(startDate)
                    .build();
            jpaRepository.save(entity);
        }
    }
}
