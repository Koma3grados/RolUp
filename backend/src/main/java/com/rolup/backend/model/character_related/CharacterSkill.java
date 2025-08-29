package com.rolup.backend.model.character_related;

import com.rolup.backend.model.Skill;
import com.rolup.backend.model.enums.Source;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "character_skills")
public class CharacterSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "character_skill_seq")
    @SequenceGenerator(name = "character_skill_seq", sequenceName = "character_skill_seq", allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "character_id")
    private Character character;

    @ManyToOne
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Enumerated(EnumType.STRING)
    private Source source;

    private Boolean favourite;

    private Integer currentUses;     // Usos disponibles actuales

}
