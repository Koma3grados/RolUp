package com.rolup.backend.model.character_related;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class CharacterAbilityStats {

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "athletics_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "athletics_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "athletics_proficient"))
    })
    private CharacterAbilityStatsValue athletics;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "acrobatics_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "acrobatics_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "acrobatics_proficient"))
    })
    private CharacterAbilityStatsValue acrobatics;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "sleight_of_hand_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "sleight_of_hand_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "sleight_of_hand_proficient"))
    })
    private CharacterAbilityStatsValue sleightOfHand;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "stealth_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "stealth_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "stealth_proficient"))
    })
    private CharacterAbilityStatsValue stealth;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "arcana_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "arcana_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "arcana_proficient"))
    })
    private CharacterAbilityStatsValue arcana;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "history_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "history_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "history_proficient"))
    })
    private CharacterAbilityStatsValue history;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "investigation_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "investigation_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "investigation_proficient"))
    })
    private CharacterAbilityStatsValue investigation;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "nature_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "nature_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "nature_proficient"))
    })
    private CharacterAbilityStatsValue nature;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "religion_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "religion_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "religion_proficient"))
    })
    private CharacterAbilityStatsValue religion;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "animal_handling_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "animal_handling_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "animal_handling_proficient"))
    })
    private CharacterAbilityStatsValue animalHandling;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "insight_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "insight_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "insight_proficient"))
    })
    private CharacterAbilityStatsValue insight;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "medicine_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "medicine_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "medicine_proficient"))
    })
    private CharacterAbilityStatsValue medicine;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "perception_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "perception_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "perception_proficient"))
    })
    private CharacterAbilityStatsValue perception;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "survival_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "survival_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "survival_proficient"))
    })
    private CharacterAbilityStatsValue survival;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "deception_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "deception_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "deception_proficient"))
    })
    private CharacterAbilityStatsValue deception;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "intimidation_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "intimidation_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "intimidation_proficient"))
    })
    private CharacterAbilityStatsValue intimidation;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "performance_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "performance_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "performance_proficient"))
    })
    private CharacterAbilityStatsValue performance;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "persuasion_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "persuasion_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "persuasion_proficient"))
    })
    private CharacterAbilityStatsValue persuasion;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "saving_throw_strength_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "saving_throw_strength_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "saving_throw_strength_proficient"))
    })
    private CharacterAbilityStatsValue savingThrowStrength;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "saving_throw_dexterity_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "saving_throw_dexterity_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "saving_throw_dexterity_proficient"))
    })
    private CharacterAbilityStatsValue savingThrowDexterity;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "saving_throw_constitution_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "saving_throw_constitution_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "saving_throw_constitution_proficient"))
    })
    private CharacterAbilityStatsValue savingThrowConstitution;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "saving_throw_intelligence_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "saving_throw_intelligence_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "saving_throw_intelligence_proficient"))
    })
    private CharacterAbilityStatsValue savingThrowIntelligence;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "saving_throw_wisdom_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "saving_throw_wisdom_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "saving_throw_wisdom_proficient"))
    })
    private CharacterAbilityStatsValue savingThrowWisdom;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "saving_throw_charisma_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "saving_throw_charisma_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "saving_throw_charisma_proficient"))
    })
    private CharacterAbilityStatsValue savingThrowCharisma;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "passive_perception_value")),
            @AttributeOverride(name = "manual", column = @Column(name = "passive_perception_manual")),
            @AttributeOverride(name = "proficient", column = @Column(name = "passive_perception_proficient"))
    })
    private CharacterAbilityStatsValue passivePerception;

}
