package com.rolup.backend.repository;

import com.rolup.backend.model.character_related.CharacterSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CharacterSkillRepository extends JpaRepository<CharacterSkill, Long> {
    @Query("SELECT cs FROM CharacterSkill cs JOIN FETCH cs.skill WHERE cs.character.id = :characterId")
    List<CharacterSkill> findByCharacterId(Long characterId);
    Optional<CharacterSkill> findByCharacterIdAndSkillId(Long characterId, Long skillId);
}
