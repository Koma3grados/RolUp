package com.rolup.backend.repository;

import com.rolup.backend.model.character_related.CharacterSpell;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CharacterSpellRepository extends JpaRepository<CharacterSpell, Long> {
    @Query("SELECT cs FROM CharacterSpell cs JOIN FETCH cs.spell WHERE cs.character.id = :characterId")
    List<CharacterSpell> findByCharacterId(Long characterId);
    Optional<CharacterSpell> findByCharacterIdAndSpellId(Long characterId, Long spellId);
}
