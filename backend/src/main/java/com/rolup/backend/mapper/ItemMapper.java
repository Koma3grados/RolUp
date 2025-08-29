package com.rolup.backend.mapper;

import com.rolup.backend.dto.itemDTOs.ItemDTO;
import com.rolup.backend.model.enums.RestType;
import com.rolup.backend.model.item_related.Item;
import com.rolup.backend.model.item_related.Weapon;
import com.rolup.backend.model.item_related.Armor;
import com.rolup.backend.model.enums.Rarity;
import com.rolup.backend.model.enums.ItemCategory;

public class ItemMapper {

    public static Item toEntity(ItemDTO dto) {
        Item item = getItem(dto);

        item.setName(dto.getName());
        item.setDescriptionTemplate(dto.getDescriptionTemplate());
        item.setSummaryTemplate(dto.getSummaryTemplate());
        item.setIconUrl(dto.getIconUrl());
        item.setRarity(Rarity.valueOf(dto.getRarity()));
        item.setWeight(dto.getWeight() != null ? dto.getWeight() : 0d);
        item.setCategory(dto.getCategory());
        item.setRequiresAttunement(Boolean.TRUE.equals(dto.getRequiresAttunement()));
        item.setResetOn(RestType.valueOf(dto.getResetOn()));
        item.setMaxUses(dto.getMaxUses());
        item.setMaxUsesAutoCalculated(Boolean.TRUE.equals(dto.getMaxUsesAutoCalculated()));
        item.setMaxUsesAutoFormula(dto.getMaxUsesAutoFormula());
        item.setStackable(Boolean.TRUE.equals(dto.getStackable()));

        if (dto.getCost() != null) {
            Item.Cost cost = new Item.Cost();
            cost.setQuantity(dto.getCost().getQuantity());
            cost.setUnit(dto.getCost().getUnit());
            item.setCost(cost);
        }

        return item;
    }

    private static Item getItem(ItemDTO dto) {
        Item item;
        if (dto.getCategory() == ItemCategory.WEAPON) {
            Weapon weapon = new Weapon();
            weapon.setRange(dto.getRange());
            weapon.setDamage(dto.getDamage());
            item = weapon;
        } else if (dto.getCategory() == ItemCategory.ARMOR) {
            Armor armor = new Armor();
            armor.setArmorClassFormula(dto.getArmorClassFormula());
            item = armor;
        } else {
            item = new Item();
        }
        return item;
    }

    public static ItemDTO toDTO(Item item) {
        ItemDTO dto = new ItemDTO();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setDescriptionTemplate(item.getDescriptionTemplate());
        dto.setSummaryTemplate(item.getSummaryTemplate());
        dto.setIconUrl(item.getIconUrl());
        dto.setRarity(String.valueOf(item.getRarity()));
        dto.setWeight(item.getWeight());
        dto.setCategory(item.getCategory());
        dto.setRequiresAttunement(item.isRequiresAttunement());
        dto.setResetOn(String.valueOf(item.getResetOn()));
        dto.setMaxUses(item.getMaxUses());
        dto.setMaxUsesAutoCalculated(item.isMaxUsesAutoCalculated());
        dto.setMaxUsesAutoFormula(item.getMaxUsesAutoFormula());
        dto.setStackable(item.isStackable());

        if (item.getCost() != null) {
            ItemDTO.CostDTO costDTO = new ItemDTO.CostDTO();
            costDTO.setQuantity(item.getCost().getQuantity());
            costDTO.setUnit(item.getCost().getUnit());
            dto.setCost(costDTO);
        }

        // Campos específicos según la subclase
        if (item instanceof Weapon weapon) {
            dto.setRange(weapon.getRange());
            dto.setDamage(weapon.getDamage());
        } else if (item instanceof Armor armor) {
            dto.setArmorClassFormula(armor.getArmorClassFormula());
        }

        return dto;
    }

    public static void updateEntity(Item item, ItemDTO dto) {
        if (dto.getName() != null) item.setName(dto.getName());
        if (dto.getDescriptionTemplate() != null) item.setDescriptionTemplate(dto.getDescriptionTemplate());
        if (dto.getSummaryTemplate() != null) item.setSummaryTemplate(dto.getSummaryTemplate());
        if (dto.getIconUrl() != null) item.setIconUrl(dto.getIconUrl());
        if (dto.getRarity() != null) item.setRarity(Rarity.valueOf(dto.getRarity()));
        if (dto.getWeight() != null) item.setWeight(dto.getWeight());
        if (dto.getCategory() != null) item.setCategory(dto.getCategory());
        if (dto.getRequiresAttunement() != null) item.setRequiresAttunement(dto.getRequiresAttunement());
        if (dto.getResetOn() != null) item.setResetOn(RestType.valueOf(dto.getResetOn()));
        if (dto.getMaxUses() != null) item.setMaxUses(dto.getMaxUses());
        if (dto.getMaxUsesAutoCalculated() != null) item.setMaxUsesAutoCalculated(dto.getMaxUsesAutoCalculated());
        if (dto.getMaxUsesAutoFormula() != null) item.setMaxUsesAutoFormula(dto.getMaxUsesAutoFormula());
        if (dto.getStackable() != null) item.setStackable(dto.getStackable());

        if (dto.getCost() != null) {
            Item.Cost cost = new Item.Cost();
            cost.setQuantity(dto.getCost().getQuantity());
            cost.setUnit(dto.getCost().getUnit());
            item.setCost(cost);
        }

        // Actualizar campos específicos según la subclase y categoría
        if (item instanceof Weapon weapon) {
            if (dto.getRange() != null) weapon.setRange(dto.getRange());
            if (dto.getDamage() != null) weapon.setDamage(dto.getDamage());
        } else if (item instanceof Armor armor) {
            if (dto.getArmorClassFormula() != null) armor.setArmorClassFormula(dto.getArmorClassFormula());
        }
    }
}
