package com.rolup.backend.repository;

import com.rolup.backend.model.character_related.CharacterItem;
import com.rolup.backend.model.character_related.CharacterItemProperty;
import com.rolup.backend.model.item_related.ItemProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;


public interface CharacterItemPropertyRepository extends JpaRepository<CharacterItemProperty, Long> {

    @Query("SELECT cip FROM CharacterItemProperty cip " +
            "JOIN FETCH cip.characterItem ci " +
            "JOIN FETCH cip.property p " +
            "WHERE ci = :characterItem AND p = :property")
    Optional<CharacterItemProperty> findByCharacterItemAndProperty(
            @Param("characterItem") CharacterItem characterItem,
            @Param("property") ItemProperty property
    );
}