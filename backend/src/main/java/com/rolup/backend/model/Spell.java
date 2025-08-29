package com.rolup.backend.model;

import com.rolup.backend.model.character_related.CharacterSpell;
import com.rolup.backend.model.enums.Category;
import com.rolup.backend.model.enums.School;
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
@Table(name = "spells")
public class Spell {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "spell_seq")
    @SequenceGenerator(name = "spell_seq", sequenceName = "spell_seq", allocationSize = 1)
    private Long id;

    private String name;
    private int level;
    private String iconUrl;
    private boolean concentration;

    @Column(length = 2048)
    private String descriptionTemplate; // Se incluye el rango, componentes, duración, tiempo de lanzamiento y otros datos como el daño

    @Column(length = 1024)
    private String summaryTemplate;

    @Enumerated(EnumType.STRING)
    private School school;

    @ElementCollection(targetClass = Category.class)
    @CollectionTable(name = "spell_categories", joinColumns = @JoinColumn(name = "spell_id"))
    @Column(name = "category")
    @Enumerated(EnumType.STRING)
    private List<Category> categories = new ArrayList<>();

    @OneToMany(mappedBy = "spell", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CharacterSpell> characterSpells = new ArrayList<>();

}
