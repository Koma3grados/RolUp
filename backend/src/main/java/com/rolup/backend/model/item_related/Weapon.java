package com.rolup.backend.model.item_related;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "weapons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Weapon extends Item {

    private String range;
    private String damage;

}
