package com.rolup.backend.dto;

import com.rolup.backend.model.enums.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SpellDTO {

    private Long id;

    @NotBlank
    private String name;

    @NotNull
    private Integer level;

    @NotBlank
    private String school;

    @NotBlank
    private String descriptionTemplate;

    private String summaryTemplate;

    private String iconUrl;

    @NotNull
    private Boolean concentration;

    @NotNull
    private List<Category> categories;

    // CharacterSpell
    private Boolean prepared;
    private String source;
    private Boolean favourite;

}
