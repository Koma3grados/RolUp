package com.rolup.backend.controller;

import com.rolup.backend.config.security.SecurityUtils;
import com.rolup.backend.dto.SkillDTO;
import com.rolup.backend.exception.BadRequestException;
import com.rolup.backend.exception.ForbiddenException;
import com.rolup.backend.service.CharacterService;
import com.rolup.backend.service.SkillService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    @Autowired
    private SkillService skillService;
    @Autowired
    private CharacterService characterService;

    // Crear habilidad
    @PostMapping("/create")
    public ResponseEntity<SkillDTO> createSkill(@Valid @RequestBody SkillDTO dto, Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden crear habilidades.");
        }
        return ResponseEntity.status(201).body(skillService.createSkill(dto));
    }

    // Obtiene todas las habilidades visibles para un personaje
    @GetMapping("/all")
    public ResponseEntity<List<SkillDTO>> getAllSkills(
            @RequestParam(required = false) Long characterId,
            Authentication auth) {

        boolean isAdmin = SecurityUtils.isAdmin(auth);

        if (isAdmin && characterId == null) {
            return ResponseEntity.ok(skillService.getAllSkillsForAdmin());
        }

        if (!isAdmin) {
            if (characterId == null) {
                throw new BadRequestException("El ID del personaje es obligatorio.");
            }

            String username = auth.getName();
            characterService.verifyCharacterOwnership(characterId, username);
        }

        return ResponseEntity.ok(skillService.getSkillsForCharacter(characterId));
    }

    // Obtener una habilidad específica
    @GetMapping("/{id}")
    public ResponseEntity<SkillDTO> getSkillById(@PathVariable Long id,
                                                 @RequestParam(required = false) Long characterId,
                                                 Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            if (characterId == null) {
                throw new BadRequestException("Se requiere el ID del personaje.");
            }
            if (!skillService.isSkillVisibleToCharacter(id, characterId)) {
                throw new ForbiddenException("No tienes permiso para ver esta habilidad.");
            }
            // Verificar que el personaje pertenece al usuario autenticado
            String username = auth.getName();
            characterService.verifyCharacterOwnership(characterId, username);
        }

        return ResponseEntity.ok(skillService.getSkillDTOById(id));
    }

    // Actualizar una habilidad
    @PatchMapping("/{id}")
    public ResponseEntity<SkillDTO> updateSkill(@PathVariable Long id,
                                                @Valid @RequestBody SkillDTO dto,
                                                Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden editar habilidades.");
        }
        return ResponseEntity.ok(skillService.updateSkill(id, dto));
    }

    // Cambiar usos de una habilidad para un personaje
    @PatchMapping("/{skillId}/change-current-uses")
    public ResponseEntity<Void> toggleSpellPreparedStatus(
            @PathVariable Long skillId,
            @RequestParam Long characterId,
            @RequestParam int uses,
            Authentication auth) {

        if (!SecurityUtils.isAdmin(auth)) {
            // Verificar que el personaje pertenece al usuario autenticado
            String username = auth.getName();
            characterService.verifyCharacterOwnership(characterId, username);
        }

        skillService.changeSkillCurrentUses(characterId, skillId, uses);
        return ResponseEntity.noContent().build();
    }

    // Eliminar una habilidad
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long id, Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden eliminar habilidades.");
        }
        skillService.deleteSkill(id);
        return ResponseEntity.noContent().build();
    }
}
