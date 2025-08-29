package com.rolup.backend.model.item_related;

import com.rolup.backend.model.enums.RestType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "item_properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemProperty {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "itemProperty_seq")
    @SequenceGenerator(name = "itemProperty_seq", sequenceName = "itemProperty_seq", allocationSize = 1)
    private Long id;

    private String name;

    @Column(length = 1024)
    private String description;

    private Integer baseMaxUses; // Si es 0 es una pasiva

    @Enumerated(EnumType.STRING)
    private RestType resetOn;
}