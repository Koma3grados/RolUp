package com.rolup.backend.dto.characterDTOs;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.rolup.backend.model.enums.Stat;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CharacterDTO {
    private Long id;

    @NotBlank
    private String name;

    private String race;
    private String characterClass;
    private String background;
    private String alignment;
    private String iconUrl;

    private Integer level;
    private Integer experience;
    private Integer experienceToNextLevel;

    private Integer strength;
    private Integer dexterity;
    private Integer constitution;
    private Integer intelligence;
    private Integer wisdom;
    private Integer charisma;

    private Integer armorClass;
    private Integer currentHp;
    private Integer maxHp;
    private Integer tempHp;
    private Integer speed;

    private Integer proficiencyBonus;
    private Boolean proficiencyBonusManual;
    private String otherProficiencies;
    private String languages;
    private String hitDiceType;
    private Integer hitDiceCurrentAmount;
    private Integer hitDiceMaxAmount;
    private String size;
    private Integer inspirationPoints;

    private List<Integer> coins; // 5 elementos

    private Integer initiative;
    private Boolean initiativeManual;

    // Items
    private Integer actualWeight;
    private Integer maxWeight;
    private Boolean maxWeightManual;

    // Spells
    private Stat spellCastingStat;

    private Integer spellCastingModifier;
    private Boolean spellCastingModifierManual;

    private Integer spellSaveDC;
    private Boolean spellSaveDCManual;

    private Integer maxPreparedSpells;

    private List<Integer> knownSpells; // 10 elementos (niveles 0-9)
    private List<CharacterSpellSlotDTO> spellSlots; // lista embebida
    private CharacterAbilityStatsDTO skills;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Long accountId; // solo lo usará el admin para crear personajes en cuentas ajenas
}
