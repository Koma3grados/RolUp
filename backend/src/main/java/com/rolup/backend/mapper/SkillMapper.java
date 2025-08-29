package com.rolup.backend.mapper;

import com.rolup.backend.dto.SkillDTO;
import com.rolup.backend.model.Skill;
import com.rolup.backend.model.enums.RestType;

public class SkillMapper {

    public static Skill toEntity(SkillDTO dto) {
        Skill skill = new Skill();
        skill.setName(dto.getName());
        skill.setDescriptionTemplate(dto.getDescriptionTemplate());
        skill.setSummaryTemplate(dto.getSummaryTemplate());
        skill.setIconUrl(dto.getIconUrl());
        skill.setResetOn(RestType.valueOf(dto.getResetOn()));
        skill.setMaxUses(dto.getMaxUses());
        skill.setAutoCalculated(dto.getAutoCalculated());
        skill.setAutoFormula(dto.getAutoFormula());
        skill.setCategories(dto.getCategories());
        return skill;
    }

    public static SkillDTO toDTO(Skill skill) {
        SkillDTO dto = new SkillDTO();
        dto.setId(skill.getId());
        dto.setName(skill.getName());
        dto.setDescriptionTemplate(skill.getDescriptionTemplate());
        dto.setSummaryTemplate(skill.getSummaryTemplate());
        dto.setIconUrl(skill.getIconUrl());
        dto.setResetOn(String.valueOf(skill.getResetOn()));
        dto.setMaxUses(skill.getMaxUses());
        dto.setAutoCalculated(skill.isAutoCalculated());
        dto.setAutoFormula(skill.getAutoFormula());
        dto.setCategories(skill.getCategories());
        return dto;
    }

    public static void updateEntity(Skill skill, SkillDTO dto) {
        if (dto.getName() != null) skill.setName(dto.getName());
        if (dto.getDescriptionTemplate() != null) skill.setDescriptionTemplate(dto.getDescriptionTemplate());
        if (dto.getSummaryTemplate() != null) skill.setSummaryTemplate(dto.getSummaryTemplate());
        if (dto.getIconUrl() != null) skill.setIconUrl(dto.getIconUrl());
        if (dto.getResetOn() != null) skill.setResetOn(RestType.valueOf(dto.getResetOn()));
        if (dto.getMaxUses() != null) skill.setMaxUses(dto.getMaxUses());
        if (dto.getAutoCalculated() != null) skill.setAutoCalculated(dto.getAutoCalculated());
        if (dto.getAutoFormula() != null) skill.setAutoFormula(dto.getAutoFormula());
        if (dto.getCategories() != null) skill.setCategories(dto.getCategories());
    }
}
