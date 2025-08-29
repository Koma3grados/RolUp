package com.rolup.backend.repository;

import com.rolup.backend.model.character_related.Character;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CharacterRepository extends JpaRepository<Character, Long> {
    List<Character> findByAccountUsername(String username);

    boolean existsByIdAndAccountUsername(Long id, String username);
}
