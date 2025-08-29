package com.rolup.backend.model.character_related;

import com.rolup.backend.model.item_related.Item;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.ArrayList;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "character_items")
public class CharacterItem {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "character_item_seq")
    @SequenceGenerator(name = "character_item_seq", sequenceName = "character_item_seq", allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "character_id")
    private Character character;

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;

    private int currentUses;

    private boolean attuned;

    private boolean equipped;

    private boolean favourite;

    private int quantity; // Siempre será 1 si el objeto tiene propiedades con usos

    @OneToMany(mappedBy = "characterItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CharacterItemProperty> properties = new ArrayList<>();

}
