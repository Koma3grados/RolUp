package com.rolup.backend.dto.characterDTOs;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO utilizado para mostrar una lista de personajes en las ventanas principales del frontend
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CharacterSummaryDTO {
    private Long id;
    private String name;
    private String iconUrl;
    private Integer level;
    private String characterClass;
    private String race;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String accountUsername; // Solo visible si es admin
}