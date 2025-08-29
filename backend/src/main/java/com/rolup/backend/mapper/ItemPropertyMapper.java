package com.rolup.backend.mapper;

import com.rolup.backend.dto.itemDTOs.ItemPropertyDTO;
import com.rolup.backend.model.enums.RestType;
import com.rolup.backend.model.item_related.ItemProperty;

public class ItemPropertyMapper {

    public static ItemProperty toEntity(ItemPropertyDTO dto) {
        ItemProperty property = new ItemProperty();
        property.setName(dto.getName());
        property.setDescription(dto.getDescription());
        if (dto.getBaseMaxUses() != null) property.setBaseMaxUses(dto.getBaseMaxUses());
        property.setResetOn(RestType.valueOf(dto.getResetOn()));
        return property;
    }

    public static ItemPropertyDTO toDTO(ItemProperty entity) {
        ItemPropertyDTO dto = new ItemPropertyDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setBaseMaxUses(entity.getBaseMaxUses());
        dto.setResetOn(String.valueOf(entity.getResetOn()));
        return dto;
    }

    public static void updateEntity(ItemProperty entity, ItemPropertyDTO dto) {
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getBaseMaxUses() != null) entity.setBaseMaxUses(dto.getBaseMaxUses());
        if (dto.getResetOn() != null) entity.setResetOn(RestType.valueOf(dto.getResetOn()));
    }

}
