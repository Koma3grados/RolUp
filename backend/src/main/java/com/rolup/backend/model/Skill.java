package com.rolup.backend.model;

import com.rolup.backend.model.character_related.CharacterSkill;
import com.rolup.backend.model.enums.Category;
import com.rolup.backend.model.enums.RestType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "skills")
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "skill_seq")
    @SequenceGenerator(name = "skill_seq", sequenceName = "skill_seq", allocationSize = 1)
    private Long id;

    private String name;

    @Column(length = 2048)
    private String descriptionTemplate;

    @Column(length = 1024)
    private String summaryTemplate;

    private String iconUrl; // Ruta o URL del icono asociado

    @Enumerated(EnumType.STRING)
    private RestType resetOn;

    private Integer maxUses;         // Usos máximos (si se calculan a mano). 0 indica habilidad pasiva
    private boolean autoCalculated;  // Si es true, los usos máximos se calculan según algún atributo
    private String autoFormula;      // El atributo o fórmula que se toma. Ej: "proficiencyBonus", "charismaMod+2"

    @ElementCollection(targetClass = Category.class)
    @CollectionTable(name = "skill_categories", joinColumns = @JoinColumn(name = "skill_id"))
    @Column(name = "category")
    @Enumerated(EnumType.STRING)
    private List<Category> categories = new ArrayList<>();

    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CharacterSkill> characterSkills = new ArrayList<>();
}