package com.rolup.backend.dto.characterDTOs;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CharacterSpellSlotDTO {
    private int level;
    private int currentSlots;
    private int maxSlots;
}
