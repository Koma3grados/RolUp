package com.rolup.backend.dto.characterDTOs;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CharacterAbilityStatsValueDTO {
    private Integer value;
    private boolean manual;
    private boolean proficient;
}