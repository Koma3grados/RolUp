package com.rolup.backend.controller;

import com.rolup.backend.config.security.SecurityUtils;
import com.rolup.backend.dto.characterDTOs.CharacterSummaryDTO;
import com.rolup.backend.dto.ListOfIdsAndSourceDTO;
import com.rolup.backend.dto.characterDTOs.CharacterDTO;
import com.rolup.backend.exception.BadRequestException;
import com.rolup.backend.exception.ForbiddenException;
import com.rolup.backend.service.CharacterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/characters")
public class CharacterController {

    @Autowired
    private CharacterService characterService;

    // Obtener un personaje por id
    @GetMapping("/{characterId}")
    public ResponseEntity<CharacterDTO> getCharacterById(@PathVariable Long characterId, Authentication auth) {

        String username = auth.getName();
        if (!SecurityUtils.isAdmin(auth)) {
            characterService.verifyCharacterOwnership(characterId, username);
        }

        CharacterDTO dto = characterService.getCharacterById(characterId);
        return ResponseEntity.ok(dto);
    }

    // Obtener todos los personajes en una lista
    @GetMapping
    public ResponseEntity<List<CharacterSummaryDTO>> getAllCharacters(Authentication auth) {
        String username = auth.getName();
        boolean isAdmin = SecurityUtils.isAdmin(auth);

        List<CharacterSummaryDTO> list = characterService.getAllCharacters(username, isAdmin);
        return ResponseEntity.ok(list);
    }

    // Crear un personaje
    @PostMapping("/create")
    public ResponseEntity<CharacterDTO> createCharacter(@RequestBody Map<String, String> body, Authentication auth) {
        String name = body.get("name");
        if (name == null || name.trim().isEmpty()) {
            throw new BadRequestException("El nombre es obligatorio");
        }

        String username = auth.getName();
        CharacterDTO dto = new CharacterDTO();
        dto.setName(name);
        CharacterDTO created = characterService.createCharacter(dto, username);
        return ResponseEntity.ok(created);
    }


    // Asociar conjuros a personaje (solo admin)
    @PostMapping("/{characterId}/spells/add")
    public ResponseEntity<String> addSpellsToCharacter(@PathVariable Long characterId,
                                                       @RequestBody ListOfIdsAndSourceDTO request,
                                                       Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden asociar conjuros.");
        }
        characterService.addSpellsToCharacter(characterId, request.getListOfIds(), request.getSource());
        return ResponseEntity.ok("Conjuros añadidos");
    }

    // Desasociar conjuros (solo admin)
    @PutMapping("/{characterId}/spells/remove")
    public ResponseEntity<String> removeSpellsFromCharacter(@PathVariable Long characterId,
                                                            @RequestBody ListOfIdsAndSourceDTO request,
                                                            Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden desasociar conjuros.");
        }
        characterService.removeSpellsFromCharacter(characterId, request.getListOfIds());
        return ResponseEntity.ok("Conjuros eliminados");
    }

    // Asociar ítems (admin o dueño)
    @PostMapping("/{characterId}/items/add")
    public ResponseEntity<String> addItemsToCharacter(@PathVariable Long characterId,
                                                      @RequestBody ListOfIdsAndSourceDTO request,
                                                      Authentication auth) {
        String username = auth.getName();
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden asociar ítems.");
        }

        characterService.addItemsToCharacter(characterId, request.getListOfIds());
        return ResponseEntity.ok("Ítems añadidos");
    }

    // Desasociar ítems
    @PutMapping("/{characterId}/items/remove")
    public ResponseEntity<String> removeItemsFromCharacter(@PathVariable Long characterId,
                                                           @RequestBody ListOfIdsAndSourceDTO request,
                                                           Authentication auth) {
        String username = auth.getName();
        if (!SecurityUtils.isAdmin(auth)) {
            characterService.verifyCharacterOwnership(characterId, username);
        }

        characterService.removeItemsFromCharacter(characterId, request.getListOfIds());
        return ResponseEntity.ok("Ítems eliminados");
    }

    // Asociar skills
    @PostMapping("/{characterId}/skills/add")
    public ResponseEntity<String> addSkillsToCharacter(@PathVariable Long characterId,
                                                       @RequestBody ListOfIdsAndSourceDTO request,
                                                       Authentication auth) {
        String username = auth.getName();
        if (!SecurityUtils.isAdmin(auth)) {
            characterService.verifyCharacterOwnership(characterId, username);
        }

        characterService.addSkillsToCharacter(characterId, request.getListOfIds(), request.getSource());
        return ResponseEntity.ok("Habilidades añadidas");
    }

    // Desasociar skills
    @PutMapping("/{characterId}/skills/remove")
    public ResponseEntity<String> removeSkillsFromCharacter(@PathVariable Long characterId,
                                                            @RequestBody ListOfIdsAndSourceDTO request,
                                                            Authentication auth) {
        String username = auth.getName();
        if (!SecurityUtils.isAdmin(auth)) {
            characterService.verifyCharacterOwnership(characterId, username);
        }

        characterService.removeSkillsFromCharacter(characterId, request.getListOfIds());
        return ResponseEntity.ok("Habilidades eliminadas");
    }

    // Actualizar personaje
    @PatchMapping("/{characterId}/update")
    public ResponseEntity<String> updateCharacter(@PathVariable Long characterId,
                                                  @RequestBody CharacterDTO dto,
                                                  Authentication auth) {
        String username = auth.getName();
        if (!SecurityUtils.isAdmin(auth)) {
            characterService.verifyCharacterOwnership(characterId, username);
        }

        characterService.updateCharacter(characterId, dto);
        return ResponseEntity.ok("Personaje actualizado");
    }

    // Eliminar personaje
    @DeleteMapping("/{characterId}")
    public ResponseEntity<String> deleteCharacter(@PathVariable Long characterId,
                                                  Authentication auth) {
        String username = auth.getName();
        if (!SecurityUtils.isAdmin(auth)) {
            characterService.verifyCharacterOwnership(characterId, username);
        }

        characterService.deleteCharacter(characterId);
        return ResponseEntity.ok("Personaje eliminado");
    }
}
