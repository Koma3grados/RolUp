package com.rolup.backend.dto.characterDTOs;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CharacterAbilityStatsDTO {
    private CharacterAbilityStatsValueDTO athletics;
    private CharacterAbilityStatsValueDTO acrobatics;
    private CharacterAbilityStatsValueDTO sleightOfHand;
    private CharacterAbilityStatsValueDTO stealth;
    private CharacterAbilityStatsValueDTO arcana;
    private CharacterAbilityStatsValueDTO history;
    private CharacterAbilityStatsValueDTO investigation;
    private CharacterAbilityStatsValueDTO nature;
    private CharacterAbilityStatsValueDTO religion;
    private CharacterAbilityStatsValueDTO animalHandling;
    private CharacterAbilityStatsValueDTO insight;
    private CharacterAbilityStatsValueDTO medicine;
    private CharacterAbilityStatsValueDTO perception;
    private CharacterAbilityStatsValueDTO survival;
    private CharacterAbilityStatsValueDTO deception;
    private CharacterAbilityStatsValueDTO intimidation;
    private CharacterAbilityStatsValueDTO performance;
    private CharacterAbilityStatsValueDTO persuasion;

    private CharacterAbilityStatsValueDTO savingThrowStrength;
    private CharacterAbilityStatsValueDTO savingThrowDexterity;
    private CharacterAbilityStatsValueDTO savingThrowConstitution;
    private CharacterAbilityStatsValueDTO savingThrowIntelligence;
    private CharacterAbilityStatsValueDTO savingThrowWisdom;
    private CharacterAbilityStatsValueDTO savingThrowCharisma;

    private CharacterAbilityStatsValueDTO passivePerception;
}

