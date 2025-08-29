package com.rolup.backend.dto;

import com.rolup.backend.model.enums.Category;
import com.rolup.backend.model.enums.RestType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import com.rolup.backend.model.enums.Source;

import java.util.List;

@Getter
@Setter
public class SkillDTO {

    private Long id;

    @NotBlank
    private String name;

    @NotBlank
    private String descriptionTemplate;

    private String summaryTemplate;

    private String iconUrl;

    private String resetOn;

    private Integer maxUses;

    private Boolean autoCalculated;

    private String autoFormula;

    // CharacterSkill
    private Integer currentUses;
    private String source;

    @NotNull
    private List<Category> categories;
}

