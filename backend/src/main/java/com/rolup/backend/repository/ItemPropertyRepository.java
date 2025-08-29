package com.rolup.backend.repository;

import com.rolup.backend.model.item_related.ItemProperty;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemPropertyRepository extends JpaRepository <ItemProperty, Long> {
}
