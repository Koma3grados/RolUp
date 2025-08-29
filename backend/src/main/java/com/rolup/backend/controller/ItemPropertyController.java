package com.rolup.backend.controller;

import com.rolup.backend.config.security.SecurityUtils;
import com.rolup.backend.dto.itemDTOs.ItemPropertyDTO;
import com.rolup.backend.exception.ForbiddenException;
import com.rolup.backend.service.ItemPropertyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/item-properties")
public class ItemPropertyController {

    @Autowired
    private ItemPropertyService itemPropertyService;

    // Crear una propiedad
    @PostMapping("/create")
    public ResponseEntity<ItemPropertyDTO> create(@Valid @RequestBody ItemPropertyDTO dto,
                                                          Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden crear propiedades de ítem.");
        }
        return ResponseEntity.status(201).body(itemPropertyService.create(dto));
    }

    // Obtener todas las propiedades
    @GetMapping("/all")
    public ResponseEntity<List<ItemPropertyDTO>> getAll(Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden ver todas las propiedades.");
        }
        return ResponseEntity.ok(itemPropertyService.getAll());
    }

    // Obtiene una propiedad concreta
    @GetMapping("/{id}")
    public ResponseEntity<ItemPropertyDTO> getById(@PathVariable Long id, Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden ver propiedades de ítem.");
        }
        return ResponseEntity.ok(itemPropertyService.getById(id));
    }

    // Actualizar una propiedad
    @PatchMapping("/{id}")
    public ResponseEntity<ItemPropertyDTO> update(@PathVariable Long id,
                                                          @Valid @RequestBody ItemPropertyDTO dto,
                                                          Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden modificar propiedades.");
        }
        return ResponseEntity.ok(itemPropertyService.update(id, dto));
    }

    // Borrar una propiedad
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden eliminar propiedades.");
        }
        itemPropertyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
