package com.rolup.backend.dto.itemDTOs;

import com.rolup.backend.model.enums.CostUnit;
import com.rolup.backend.model.enums.ItemCategory;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ItemDTO {
    @Getter
    @Setter
    public static class CostDTO {
        private Double quantity;
        private CostUnit unit;
    }

    private Long id;

    private String name;

    private String descriptionTemplate;

    private String summaryTemplate;

    private String iconUrl;

    private CostDTO cost;

    private String rarity; // Enum

    private Double weight;

    private ItemCategory category; // Enum

    private Boolean requiresAttunement;

    private List<ItemPropertyDTO> propertyDTOList; // Campo especial usado solo como salida

    private String resetOn; // Enum

    private Integer currentUses;
    private Integer maxUses;

    private Boolean maxUsesAutoCalculated;

    private String MaxUsesAutoFormula;

    private Boolean stackable; // Si se puede stackear en un CharacterItem

    // Campos específicos para Weapon
    private String range;
    private String damage;

    // Campo específico para Armor
    private String armorClassFormula;

    // CharacterItem
    private Boolean attuned;
    private Boolean equipped;
    private Integer quantity;

}
