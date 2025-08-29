package com.rolup.backend.repository;

import com.rolup.backend.model.Spell;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SpellRepository extends JpaRepository<Spell, Long> {

    // Spells visibles por un personaje
    @Query("SELECT cs.spell FROM CharacterSpell cs WHERE cs.character.id = :characterId")
    List<Spell> findVisibleToCharacter(Long characterId);

}
