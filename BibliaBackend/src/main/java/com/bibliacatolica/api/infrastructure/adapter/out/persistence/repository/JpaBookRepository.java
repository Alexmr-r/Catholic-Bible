package com.bibliacatolica.api.infrastructure.adapter.out.persistence.repository;

import com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity.BookEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaBookRepository extends JpaRepository<BookEntity, String> {

    List<BookEntity> findByTestamentOrderByOrderIndexAsc(String testament);

    List<BookEntity> findAllByOrderByOrderIndexAsc();
}

