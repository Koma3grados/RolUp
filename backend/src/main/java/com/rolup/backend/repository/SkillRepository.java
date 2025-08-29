package com.rolup.backend.repository;

import com.rolup.backend.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    // Skills visibles por un personaje
    @Query("SELECT cs.skill FROM CharacterSkill cs WHERE cs.character.id = :characterId")
    List<Skill> findVisibleToCharacter(Long characterId);

}
