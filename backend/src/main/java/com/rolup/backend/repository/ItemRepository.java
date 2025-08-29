package com.rolup.backend.repository;

import com.rolup.backend.model.item_related.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    @Query("SELECT ci.item FROM CharacterItem ci WHERE ci.character.id = :characterId")
    List<Item> findVisibleToCharacter(Long characterId);

    @Query("SELECT COUNT(ci) > 0 FROM CharacterItem ci WHERE ci.character.id = :characterId AND ci.item.id = :itemId")
    boolean existsByCharacterIdAndItemId(Long characterId, Long itemId);

}