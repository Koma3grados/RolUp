package com.rolup.backend.repository;
import com.rolup.backend.model.character_related.CharacterItem;
import com.rolup.backend.model.character_related.CharacterSpell;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;


public interface CharacterItemRepository extends JpaRepository<CharacterItem, Long> {
    boolean existsByIdAndCharacterId(Long characterItemId, Long characterId);

    @Query("SELECT ci FROM CharacterItem ci WHERE ci.character.id = :characterId")
    List<CharacterItem> findByCharacterId(Long characterId);

    // En CharacterItemRepository
    @Query("SELECT ci FROM CharacterItem ci WHERE ci.character.id = :characterId AND ci.item.id = :itemId")
    Optional<CharacterItem> findByCharacterIdAndItemId(Long characterId, Long itemId);

    @Query("SELECT ci FROM CharacterItem ci WHERE ci.item.id = :itemId")
    List<CharacterItem> findByItemId(Long itemId);
}
