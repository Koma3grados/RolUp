package com.rolup.backend.mapper;

import com.rolup.backend.dto.SpellDTO;
import com.rolup.backend.model.Spell;
import com.rolup.backend.model.enums.School;

public class SpellMapper {

    public static Spell toEntity(SpellDTO dto) {
        Spell spell = new Spell();
        spell.setName(dto.getName());
        spell.setLevel(dto.getLevel());
        spell.setDescriptionTemplate(dto.getDescriptionTemplate());
        spell.setSummaryTemplate(dto.getSummaryTemplate());
        spell.setIconUrl(dto.getIconUrl());
        spell.setConcentration(dto.getConcentration());
        spell.setSchool(School.valueOf(dto.getSchool()));
        spell.setCategories(dto.getCategories());
        return spell;
    }

    public static SpellDTO toDTO(Spell spell) {
        SpellDTO dto = new SpellDTO();
        dto.setId(spell.getId());
        dto.setName(spell.getName());
        dto.setLevel(spell.getLevel());
        dto.setDescriptionTemplate(spell.getDescriptionTemplate());
        dto.setSummaryTemplate(spell.getSummaryTemplate());
        dto.setIconUrl(spell.getIconUrl());
        dto.setConcentration(spell.isConcentration());
        dto.setSchool(spell.getSchool().name());
        dto.setCategories(spell.getCategories());
        return dto;
    }

    public static void updateEntity(Spell spell, SpellDTO dto) {
        if (dto.getName() != null) spell.setName(dto.getName());
        if (dto.getLevel() != null) spell.setLevel(dto.getLevel());
        if (dto.getDescriptionTemplate() != null) spell.setDescriptionTemplate(dto.getDescriptionTemplate());
        if (dto.getSummaryTemplate() != null) spell.setSummaryTemplate(dto.getSummaryTemplate());
        if (dto.getIconUrl() != null) spell.setIconUrl(dto.getIconUrl());
        if (dto.getSchool() != null) spell.setSchool(School.valueOf(dto.getSchool()));
        if (dto.getCategories() != null) spell.setCategories(dto.getCategories());
        if (dto.getConcentration() != null) spell.setConcentration(dto.getConcentration());
    }

}
