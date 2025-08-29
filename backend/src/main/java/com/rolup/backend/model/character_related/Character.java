package com.rolup.backend.model.character_related;

import com.rolup.backend.model.*;
import com.rolup.backend.model.enums.Stat;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Entity
@Table(name = "characters")
public class Character {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class SpellSlot {
        @Column(name = "spell_level")
        private int level;           // Nivel del conjuro (0-9)
        private int currentSlots;    // Huecos actuales disponibles
        private int maxSlots;        // Huecos totales
    }

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "character_seq")
    @SequenceGenerator(name = "character_seq", sequenceName = "character_seq", allocationSize = 1)
    private Long id;

    private String name;
    private String race;
    private String characterClass;
    private String background;
    private String alignment;
    private String iconUrl;

    private int level;
    private int experience;
    private int experienceToNextLevel;

    private int strength;
    private int dexterity;
    private int constitution;
    private int intelligence;
    private int wisdom;
    private int charisma;

    private int armorClass;
    private int currentHp;
    private int maxHp;
    private int tempHp;
    private int speed;

    private Integer proficiencyBonus;       // Si es manual
    private boolean proficiencyBonusManual; // true = usa el valor de arriba, false = se calcula

    private String otherProficiencies;
    private String languages;
    private String hitDiceType; // Ej: "1d8"
    private int hitDiceCurrentAmount;
    private int hitDiceMaxAmount;
    private String size;
    private int inspirationPoints;

    private int initiative;
    private boolean initiativeManual; // true = usa el valor de arriba, false = se calcula

    private int actualWeight;
    private int maxWeight;
    private boolean maxWeightManual; // true = usa el valor de arriba, false = se calcula

    private Stat spellCastingStat;        // Valor actual (manual o calculado)

    private int spellCastingModifier;
    private boolean spellCastingModifierManual; // true = el valor se definió manualmente

    private int spellSaveDC;
    private boolean spellSaveDCManual;

    private int maxPreparedSpells;

    @Column(name = "coins")
    private List<Integer> coins;  // de 0 a 4

    @Embedded
    private CharacterAbilityStats skills;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;

    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CharacterSpell> characterSpells = new ArrayList<>();

    @ElementCollection
    @CollectionTable(
            name = "character_spell_slots",
            joinColumns = @JoinColumn(name = "character_id")
    )
    private List<SpellSlot> spellSlots;

    @ElementCollection
    @CollectionTable(
            name = "character_known_spells",
            joinColumns = @JoinColumn(name = "character_id")
    )
    @Column(name = "known_spells_per_level")
    private List<Integer> knownSpells;  // del 0 a 9

    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CharacterSkill> extraSkills = new ArrayList<>();

    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CharacterItem> characterItems = new ArrayList<>();

    public Character() {
        this.knownSpells = Arrays.asList(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        this.coins = Arrays.asList(0, 0, 0, 0, 0);
        this.proficiencyBonus = 0;

        // Inicializar spellSlots para niveles 0 a 9 con 0 huecos
        this.spellSlots = new ArrayList<>();
        for (int i = 0; i <= 9; i++) {
            this.spellSlots.add(new SpellSlot(i, 0, 0));
        }

        // Inicializar todas las habilidades a valor 0, manual = false, proficient = false
        CharacterAbilityStatsValue defaultVal = new CharacterAbilityStatsValue(0, false, false);
        this.skills = new CharacterAbilityStats(
                defaultVal, // athletics
                defaultVal, // acrobatics
                defaultVal, // sleightOfHand
                defaultVal, // stealth
                defaultVal, // arcana
                defaultVal, // history
                defaultVal, // investigation
                defaultVal, // nature
                defaultVal, // religion
                defaultVal, // animalHandling
                defaultVal, // insight
                defaultVal, // medicine
                defaultVal, // perception
                defaultVal, // survival
                defaultVal, // deception
                defaultVal, // intimidation
                defaultVal, // performance
                defaultVal, // persuasion

                defaultVal, // savingThrowStrength
                defaultVal, // savingThrowDexterity
                defaultVal, // savingThrowConstitution
                defaultVal, // savingThrowIntelligence
                defaultVal, // savingThrowWisdom
                defaultVal, // savingThrowCharisma

                defaultVal  // passivePerception
        );
    }

}