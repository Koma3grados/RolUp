package com.rolup.backend.model.item_related;

import com.rolup.backend.model.enums.CostUnit;
import com.rolup.backend.model.enums.ItemCategory;
import com.rolup.backend.model.enums.Rarity;
import com.rolup.backend.model.enums.RestType;
import com.rolup.backend.model.character_related.CharacterItem;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "items")
@Inheritance(strategy = InheritanceType.JOINED)
public class Item {
    @Getter
    @Setter
    @Embeddable
    public static class Cost {
        private double quantity;
        private CostUnit unit;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "item_seq")
    @SequenceGenerator(name = "item_seq", sequenceName = "item_seq", allocationSize = 1)
    private Long id;

    private String name;

    @Column(length = 4096)
    private String descriptionTemplate;

    @Column(length = 2048)
    private String summaryTemplate;

    private String iconUrl;

    @Embedded
    private Cost cost;

    @Enumerated(EnumType.STRING)
    private Rarity rarity;

    private double weight;

    @Enumerated(EnumType.STRING)
    private ItemCategory category;
    
    private boolean requiresAttunement;

    @ManyToMany
    @JoinTable(
            name = "item_item_properties",
            joinColumns = @JoinColumn(name = "item_id"),
            inverseJoinColumns = @JoinColumn(name = "property_id")
    )
    private List<ItemProperty> properties;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CharacterItem> characterItems;

    @Enumerated(EnumType.STRING)
    private RestType resetOn;

    private Integer maxUses;                // Usos máximos (si se calculan a mano)
    private boolean maxUsesAutoCalculated;  // Si es true, se calcula según algún atributo
    private String maxUsesAutoFormula;      // Ej: "proficiencyBonus", "charismaMod"

    @Column(nullable = false)
    private boolean stackable; // Para saber si es stackeable

}
