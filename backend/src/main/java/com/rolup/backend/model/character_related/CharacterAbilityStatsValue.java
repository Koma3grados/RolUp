package com.rolup.backend.model.character_related;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class CharacterAbilityStatsValue {

    private Integer value;        // Valor actual (manual o calculado)
    private boolean manual;       // true = el valor se definió manualmente
    private boolean proficient;   // true = sumará el modificador por competencia

}