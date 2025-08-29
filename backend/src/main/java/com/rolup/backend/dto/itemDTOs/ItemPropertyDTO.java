package com.rolup.backend.dto.itemDTOs;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemPropertyDTO {

    private Long id;

    private String name;

    private String description;

    private Integer baseMaxUses; // null o 0 = pasiva

    private String resetOn; // Enum

    private Integer currentUses; // Si no es null, estamos hablando de un CharacterItemProperty
}

