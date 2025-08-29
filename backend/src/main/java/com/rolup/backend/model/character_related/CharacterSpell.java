package com.rolup.backend.model.character_related;

import com.rolup.backend.model.Spell;
import com.rolup.backend.model.enums.Source;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "character_spells")
public class CharacterSpell {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "character_spell_seq")
    @SequenceGenerator(name = "character_spell_seq", sequenceName = "character_spell_seq", allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "character_id")
    private Character character;

    @ManyToOne
    @JoinColumn(name = "spell_id")
    private Spell spell;

    private boolean prepared;

    private boolean favourite;

    @Enumerated(EnumType.STRING)
    private Source source;

}
