package com.rolup.backend.controller;

import com.rolup.backend.config.security.SecurityUtils;
import com.rolup.backend.dto.SpellDTO;
import com.rolup.backend.exception.BadRequestException;
import com.rolup.backend.exception.ForbiddenException;
import com.rolup.backend.service.CharacterService;
import com.rolup.backend.service.SpellService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/spells")
public class SpellController {

    @Autowired
    private SpellService spellService;
    @Autowired
    private CharacterService characterService;

    // Crea un conjuro
    @PostMapping("/create")
    public ResponseEntity<SpellDTO> createSpell(@Valid @RequestBody SpellDTO dto, Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden crear conjuros.");
        }
        return ResponseEntity.status(201).body(spellService.createSpell(dto));
    }

    // Obtiene todos los conjuros visibles para un personaje
    @GetMapping("/all")
    public ResponseEntity<List<SpellDTO>> getAllSpells(
            @RequestParam(required = false) Long characterId,
            Authentication auth) {

        boolean isAdmin = SecurityUtils.isAdmin(auth);

        if (isAdmin && characterId == null) {
            return ResponseEntity.ok(spellService.getAllSpellsForAdmin());
        }

        if (!isAdmin) {
            if (characterId == null) {
                throw new BadRequestException("El ID del personaje es obligatorio.");
            }

            String username = auth.getName();
            characterService.verifyCharacterOwnership(characterId, username);
        }

        return ResponseEntity.ok(spellService.getSpellsForCharacter(characterId));
    }

    // Obtiene un conjuro específico
    @GetMapping("/{id}")
    public ResponseEntity<SpellDTO> getSpellById(@PathVariable Long id,
                                                 @RequestParam(required = false) Long characterId,
                                                 Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            if (characterId == null) {
                throw new BadRequestException("Se requiere el ID del personaje.");
            }
            if (!spellService.isSpellVisibleToCharacter(id, characterId)) {
                throw new ForbiddenException("No tienes permiso para ver este conjuro.");
            }
            // Verificar que el personaje pertenece al usuario autenticado
            String username = auth.getName();
            characterService.verifyCharacterOwnership(characterId, username);
        }

        return ResponseEntity.ok(spellService.getSpellDTOById(id));
    }

    // Actualiza un conjuro
    @PatchMapping("/{id}")
    public ResponseEntity<SpellDTO> updateSpell(@PathVariable Long id,
                                                @Valid @RequestBody SpellDTO dto,
                                                Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden editar conjuros.");
        }
        return ResponseEntity.ok(spellService.updateSpell(id, dto));
    }

    // Borrar un conjuro
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSpell(@PathVariable Long id, Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden eliminar conjuros.");
        }
        spellService.deleteSpell(id);
        return ResponseEntity.noContent().build();
    }

    // Alternar estado "preparado" de un conjuro para un personaje
    @PatchMapping("/{spellId}/toggle-prepared")
    public ResponseEntity<Void> toggleSpellPreparedStatus(
            @PathVariable Long spellId,
            @RequestParam Long characterId,
            Authentication auth) {

        if (!SecurityUtils.isAdmin(auth)) {
            // Verificar que el personaje pertenece al usuario autenticado
            String username = auth.getName();
            characterService.verifyCharacterOwnership(characterId, username);
        }

        spellService.toggleSpellPreparedStatus(characterId, spellId);
        return ResponseEntity.noContent().build();
    }

    // Alternar estado "favorito" de un conjuro para un personaje
    @PatchMapping("/{spellId}/toggle-favourite")
    public ResponseEntity<Void> toggleSpellFavouriteStatus(
            @PathVariable Long spellId,
            @RequestParam Long characterId,
            Authentication auth) {

        if (!SecurityUtils.isAdmin(auth)) {
            // Verificar que el personaje pertenece al usuario autenticado
            String username = auth.getName();
            characterService.verifyCharacterOwnership(characterId, username);
        }

        spellService.toggleSpellFavouriteStatus(characterId, spellId);
        return ResponseEntity.noContent().build();
    }

}
