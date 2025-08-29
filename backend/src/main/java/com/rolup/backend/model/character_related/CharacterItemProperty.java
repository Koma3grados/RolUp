package com.rolup.backend.model.character_related;

import com.rolup.backend.model.item_related.ItemProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "character_item_properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CharacterItemProperty {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "charItemProp_seq")
    @SequenceGenerator(name = "charItemProp_seq", sequenceName = "charItemProp_seq", allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "character_item_id")
    private CharacterItem characterItem;

    @ManyToOne
    @JoinColumn(name = "property_id")
    private ItemProperty property;

    private Integer currentUses;
}
