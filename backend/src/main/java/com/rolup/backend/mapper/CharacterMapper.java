package com.rolup.backend.mapper;

import com.rolup.backend.dto.characterDTOs.*;
import com.rolup.backend.model.character_related.Character;
import com.rolup.backend.model.character_related.Character.SpellSlot;
import com.rolup.backend.model.character_related.CharacterAbilityStatsValue;
import com.rolup.backend.model.character_related.CharacterAbilityStats;

import java.util.ArrayList;
import java.util.List;

public class CharacterMapper {

    public static CharacterDTO toDTO(Character character) {
        CharacterDTO dto = new CharacterDTO();

        dto.setId(character.getId());
        dto.setName(character.getName());
        dto.setRace(character.getRace());
        dto.setCharacterClass(character.getCharacterClass());
        dto.setBackground(character.getBackground());
        dto.setAlignment(character.getAlignment());
        dto.setIconUrl(character.getIconUrl());

        dto.setStrength(character.getStrength());
        dto.setDexterity(character.getDexterity());
        dto.setConstitution(character.getConstitution());
        dto.setIntelligence(character.getIntelligence());
        dto.setWisdom(character.getWisdom());
        dto.setCharisma(character.getCharisma());

        dto.setArmorClass(character.getArmorClass());
        dto.setCurrentHp(character.getCurrentHp());
        dto.setMaxHp(character.getMaxHp());
        dto.setTempHp(character.getTempHp());
        dto.setSpeed(character.getSpeed());

        dto.setLevel(character.getLevel());
        dto.setExperience(character.getExperience());
        dto.setExperienceToNextLevel(character.getExperienceToNextLevel());

        dto.setProficiencyBonus(character.getProficiencyBonus());
        dto.setProficiencyBonusManual(character.isProficiencyBonusManual());
        dto.setOtherProficiencies(character.getOtherProficiencies());
        dto.setLanguages(character.getLanguages());
        dto.setHitDiceType(character.getHitDiceType());
        dto.setHitDiceCurrentAmount(character.getHitDiceCurrentAmount());
        dto.setHitDiceMaxAmount(character.getHitDiceMaxAmount());
        dto.setSize(character.getSize());
        dto.setInspirationPoints(character.getInspirationPoints());

        dto.setCoins(new ArrayList<>(character.getCoins()));
        dto.setKnownSpells(new ArrayList<>(character.getKnownSpells()));

        dto.setSkills(toSkillsDTO(character.getSkills()));

        dto.setInitiative(character.getInitiative());
        dto.setInitiativeManual(character.isInitiativeManual());

        dto.setActualWeight(character.getActualWeight());
        dto.setMaxWeight(character.getMaxWeight());
        dto.setMaxWeightManual(character.isMaxWeightManual());

        dto.setSpellCastingStat(character.getSpellCastingStat());
        dto.setSpellCastingModifier(character.getSpellCastingModifier());
        dto.setSpellCastingModifierManual(character.isSpellCastingModifierManual());
        dto.setSpellSaveDC(character.getSpellSaveDC());
        dto.setSpellSaveDCManual(character.isSpellSaveDCManual());
        dto.setMaxPreparedSpells(character.getMaxPreparedSpells());

        // Mapear spellSlots
        if (character.getSpellSlots() != null) {
            List<CharacterSpellSlotDTO> slotDTOs = new ArrayList<>();
            for (SpellSlot slot : character.getSpellSlots()) {
                CharacterSpellSlotDTO slotDTO = new CharacterSpellSlotDTO();
                slotDTO.setLevel(slot.getLevel());
                slotDTO.setCurrentSlots(slot.getCurrentSlots());
                slotDTO.setMaxSlots(slot.getMaxSlots());
                slotDTOs.add(slotDTO);
            }
            dto.setSpellSlots(slotDTOs);
        }

        return dto;
    }

    // ToEntity no es necesario, al menos de momento

    public static void updateEntity(Character character, CharacterDTO dto) {
        if (dto.getName() != null) character.setName(dto.getName());
        if (dto.getRace() != null) character.setRace(dto.getRace());
        if (dto.getCharacterClass() != null) character.setCharacterClass(dto.getCharacterClass());
        if (dto.getBackground() != null) character.setBackground(dto.getBackground());
        if (dto.getAlignment() != null) character.setAlignment(dto.getAlignment());
        if (dto.getIconUrl() != null) character.setIconUrl(dto.getIconUrl());

        if (dto.getStrength() != null) character.setStrength(dto.getStrength());
        if (dto.getDexterity() != null) character.setDexterity(dto.getDexterity());
        if (dto.getConstitution() != null) character.setConstitution(dto.getConstitution());
        if (dto.getIntelligence() != null) character.setIntelligence(dto.getIntelligence());
        if (dto.getWisdom() != null) character.setWisdom(dto.getWisdom());
        if (dto.getCharisma() != null) character.setCharisma(dto.getCharisma());

        if (dto.getArmorClass() != null) character.setArmorClass(dto.getArmorClass());
        if (dto.getCurrentHp() != null) character.setCurrentHp(dto.getCurrentHp());
        if (dto.getMaxHp() != null) character.setMaxHp(dto.getMaxHp());
        if (dto.getTempHp() != null) character.setTempHp(dto.getTempHp());
        if (dto.getSpeed() != null) character.setSpeed(dto.getSpeed());

        if (dto.getLevel() != null) character.setLevel(dto.getLevel());
        if (dto.getExperience() != null) character.setExperience(dto.getExperience());
        if (dto.getExperienceToNextLevel() != null) character.setExperienceToNextLevel(dto.getExperienceToNextLevel());

        if (dto.getProficiencyBonus() != null) character.setProficiencyBonus(dto.getProficiencyBonus());
        if (dto.getProficiencyBonusManual() != null) character.setProficiencyBonusManual(dto.getProficiencyBonusManual());

        if (dto.getOtherProficiencies() != null) character.setOtherProficiencies(dto.getOtherProficiencies());
        if (dto.getLanguages() != null) character.setLanguages(dto.getLanguages());
        if (dto.getHitDiceType() != null) character.setHitDiceType(dto.getHitDiceType());
        if (dto.getHitDiceCurrentAmount() != null) character.setHitDiceCurrentAmount(dto.getHitDiceCurrentAmount());
        if (dto.getHitDiceMaxAmount() != null) character.setHitDiceMaxAmount(dto.getHitDiceMaxAmount());
        if (dto.getSize() != null) character.setSize(dto.getSize());
        if (dto.getInspirationPoints() != null) character.setInspirationPoints(dto.getInspirationPoints());

        if (dto.getCoins() != null) character.setCoins(new ArrayList<>(dto.getCoins()));
        if (dto.getKnownSpells() != null) character.setKnownSpells(new ArrayList<>(dto.getKnownSpells()));
        if (dto.getSkills() != null) {
            if (character.getSkills() == null) {
                character.setSkills(new CharacterAbilityStats());
            }
            updateSkills(character.getSkills(), dto.getSkills());
        }

        if (dto.getInitiative() != null) character.setInitiative(dto.getInitiative());
        if (dto.getInitiativeManual() != null) character.setInitiativeManual(dto.getInitiativeManual());

        if (dto.getActualWeight() != null) character.setActualWeight(dto.getActualWeight());
        if (dto.getMaxWeight() != null) character.setMaxWeight(dto.getMaxWeight());
        if (dto.getMaxWeightManual() != null) character.setMaxWeightManual(dto.getMaxWeightManual());

        if (dto.getSpellCastingStat() != null) character.setSpellCastingStat(dto.getSpellCastingStat());

        if (dto.getSpellCastingModifier() != null) character.setSpellCastingModifier(dto.getSpellCastingModifier());

        if (dto.getSpellCastingModifierManual() != null) character.setSpellCastingModifierManual(dto.getSpellCastingModifierManual());

        if (dto.getSpellSaveDC() != null) character.setSpellSaveDC(dto.getSpellSaveDC());
        if (dto.getSpellSaveDCManual() != null) character.setSpellSaveDCManual(dto.getSpellSaveDCManual());


        if (dto.getMaxPreparedSpells() != null) character.setMaxPreparedSpells(dto.getMaxPreparedSpells());

        // Solo reemplaza spellSlots si se mandan
        if (dto.getSpellSlots() != null) {
            character.getSpellSlots().clear();
            for (CharacterSpellSlotDTO slotDTO : dto.getSpellSlots()) {
                Character.SpellSlot slot = new Character.SpellSlot();
                slot.setLevel(slotDTO.getLevel());
                slot.setCurrentSlots(slotDTO.getCurrentSlots());
                slot.setMaxSlots(slotDTO.getMaxSlots());
                character.getSpellSlots().add(slot);
            }
        }
    }

    private static void updateSkills(CharacterAbilityStats skills, CharacterAbilityStatsDTO dto) {
        // Habilidades de fuerza
        if (dto.getAthletics() != null) skills.setAthletics(toSkillValueEntity(dto.getAthletics()));

        // Habilidades de destreza
        if (dto.getAcrobatics() != null) skills.setAcrobatics(toSkillValueEntity(dto.getAcrobatics()));
        if (dto.getSleightOfHand() != null) skills.setSleightOfHand(toSkillValueEntity(dto.getSleightOfHand()));
        if (dto.getStealth() != null) skills.setStealth(toSkillValueEntity(dto.getStealth()));

        // Habilidades de inteligencia
        if (dto.getArcana() != null) skills.setArcana(toSkillValueEntity(dto.getArcana()));
        if (dto.getHistory() != null) skills.setHistory(toSkillValueEntity(dto.getHistory()));
        if (dto.getInvestigation() != null) skills.setInvestigation(toSkillValueEntity(dto.getInvestigation()));
        if (dto.getNature() != null) skills.setNature(toSkillValueEntity(dto.getNature()));
        if (dto.getReligion() != null) skills.setReligion(toSkillValueEntity(dto.getReligion()));

        // Habilidades de sabiduría
        if (dto.getAnimalHandling() != null) skills.setAnimalHandling(toSkillValueEntity(dto.getAnimalHandling()));
        if (dto.getInsight() != null) skills.setInsight(toSkillValueEntity(dto.getInsight()));
        if (dto.getMedicine() != null) skills.setMedicine(toSkillValueEntity(dto.getMedicine()));
        if (dto.getPerception() != null) skills.setPerception(toSkillValueEntity(dto.getPerception()));
        if (dto.getSurvival() != null) skills.setSurvival(toSkillValueEntity(dto.getSurvival()));

        // Habilidades de carisma
        if (dto.getDeception() != null) skills.setDeception(toSkillValueEntity(dto.getDeception()));
        if (dto.getIntimidation() != null) skills.setIntimidation(toSkillValueEntity(dto.getIntimidation()));
        if (dto.getPerformance() != null) skills.setPerformance(toSkillValueEntity(dto.getPerformance()));
        if (dto.getPersuasion() != null) skills.setPersuasion(toSkillValueEntity(dto.getPersuasion()));

        // Tiradas de salvación
        if (dto.getSavingThrowStrength() != null) skills.setSavingThrowStrength(toSkillValueEntity(dto.getSavingThrowStrength()));
        if (dto.getSavingThrowDexterity() != null) skills.setSavingThrowDexterity(toSkillValueEntity(dto.getSavingThrowDexterity()));
        if (dto.getSavingThrowConstitution() != null) skills.setSavingThrowConstitution(toSkillValueEntity(dto.getSavingThrowConstitution()));
        if (dto.getSavingThrowIntelligence() != null) skills.setSavingThrowIntelligence(toSkillValueEntity(dto.getSavingThrowIntelligence()));
        if (dto.getSavingThrowWisdom() != null) skills.setSavingThrowWisdom(toSkillValueEntity(dto.getSavingThrowWisdom()));
        if (dto.getSavingThrowCharisma() != null) skills.setSavingThrowCharisma(toSkillValueEntity(dto.getSavingThrowCharisma()));

        // Percepción pasiva
        if (dto.getPassivePerception() != null) skills.setPassivePerception(toSkillValueEntity(dto.getPassivePerception()));
    }

    private static CharacterAbilityStatsDTO toSkillsDTO(CharacterAbilityStats skills) {
        if (skills == null) return null;

        CharacterAbilityStatsDTO dto = new CharacterAbilityStatsDTO();

        dto.setAthletics(toSkillValueDTO(skills.getAthletics()));
        dto.setAcrobatics(toSkillValueDTO(skills.getAcrobatics()));
        dto.setSleightOfHand(toSkillValueDTO(skills.getSleightOfHand()));
        dto.setStealth(toSkillValueDTO(skills.getStealth()));
        dto.setArcana(toSkillValueDTO(skills.getArcana()));
        dto.setHistory(toSkillValueDTO(skills.getHistory()));
        dto.setInvestigation(toSkillValueDTO(skills.getInvestigation()));
        dto.setNature(toSkillValueDTO(skills.getNature()));
        dto.setReligion(toSkillValueDTO(skills.getReligion()));
        dto.setAnimalHandling(toSkillValueDTO(skills.getAnimalHandling()));
        dto.setInsight(toSkillValueDTO(skills.getInsight()));
        dto.setMedicine(toSkillValueDTO(skills.getMedicine()));
        dto.setPerception(toSkillValueDTO(skills.getPerception()));
        dto.setSurvival(toSkillValueDTO(skills.getSurvival()));
        dto.setDeception(toSkillValueDTO(skills.getDeception()));
        dto.setIntimidation(toSkillValueDTO(skills.getIntimidation()));
        dto.setPerformance(toSkillValueDTO(skills.getPerformance()));
        dto.setPersuasion(toSkillValueDTO(skills.getPersuasion()));

        dto.setSavingThrowStrength(toSkillValueDTO(skills.getSavingThrowStrength()));
        dto.setSavingThrowDexterity(toSkillValueDTO(skills.getSavingThrowDexterity()));
        dto.setSavingThrowConstitution(toSkillValueDTO(skills.getSavingThrowConstitution()));
        dto.setSavingThrowIntelligence(toSkillValueDTO(skills.getSavingThrowIntelligence()));
        dto.setSavingThrowWisdom(toSkillValueDTO(skills.getSavingThrowWisdom()));
        dto.setSavingThrowCharisma(toSkillValueDTO(skills.getSavingThrowCharisma()));

        dto.setPassivePerception(toSkillValueDTO(skills.getPassivePerception()));

        return dto;
    }

    private static CharacterAbilityStatsValueDTO toSkillValueDTO(CharacterAbilityStatsValue skill) {
        if (skill == null) return null;

        CharacterAbilityStatsValueDTO dto = new CharacterAbilityStatsValueDTO();
        dto.setValue(skill.getValue());
        dto.setManual(skill.isManual());
        dto.setProficient(skill.isProficient());
        return dto;
    }

    private static CharacterAbilityStatsValue toSkillValueEntity(CharacterAbilityStatsValueDTO dto) {
        if (dto == null) return null;

        CharacterAbilityStatsValue skill = new CharacterAbilityStatsValue();
        skill.setValue(dto.getValue());
        skill.setManual(dto.isManual());
        skill.setProficient(dto.isProficient());
        return skill;
    }

    public static CharacterSummaryDTO toSummaryDTO(Character character) {
        CharacterSummaryDTO dto = new CharacterSummaryDTO();
        dto.setId(character.getId());
        dto.setName(character.getName());
        dto.setIconUrl(character.getIconUrl());
        dto.setLevel(character.getLevel());
        dto.setCharacterClass(character.getCharacterClass());
        dto.setRace(character.getRace());
        return dto;
    }

}
