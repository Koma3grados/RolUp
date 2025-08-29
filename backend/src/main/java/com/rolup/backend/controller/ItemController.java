package com.rolup.backend.controller;

import com.rolup.backend.config.security.SecurityUtils;
import com.rolup.backend.dto.ListOfIdsAndSourceDTO;
import com.rolup.backend.dto.itemDTOs.ItemDTO;
import com.rolup.backend.dto.itemDTOs.ItemPropertyDTO;
import com.rolup.backend.exception.BadRequestException;
import com.rolup.backend.exception.ForbiddenException;
import com.rolup.backend.service.CharacterService;
import com.rolup.backend.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    @Autowired
    private ItemService itemService;
    @Autowired
    private CharacterService characterService;

    // Crear un ítem (admin)
    @PostMapping("/create")
    public ResponseEntity<ItemDTO> createItem(@Valid @RequestBody ItemDTO dto, Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden crear ítems.");
        }
        return ResponseEntity.status(201).body(itemService.createItem(dto));
    }

    // Obtener todos los items en forma de lista
    @GetMapping("/all")
    public ResponseEntity<List<ItemDTO>> getVisibleItems(
            @RequestParam(required = false) Long characterId,
            Authentication auth) {

        boolean isAdmin = SecurityUtils.isAdmin(auth);

        if (isAdmin && characterId == null) {
            return ResponseEntity.ok(itemService.getAllItems());
        }

        if (!isAdmin) {
            if (characterId == null) {
                throw new BadRequestException("El ID del personaje es obligatorio.");
            }

            String username = auth.getName();
            characterService.verifyCharacterOwnership(characterId, username);
        }

        return ResponseEntity.ok(itemService.getAllItemsForCharacter(characterId));
    }

    // Obtener ítem específico (detalles completos) (INCOMPLETO)
    @GetMapping("/{id}")
    public ResponseEntity<ItemDTO> getItemById(@PathVariable Long id,
                                               @RequestParam(required = false) Long characterId,
                                               Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            if (characterId == null) {
                throw new BadRequestException("Se requiere el ID del personaje.");
            }

            if (!itemService.isItemVisibleToCharacter(id, characterId)) {
                throw new ForbiddenException("No tienes permiso para ver este ítem.");
            }
        } else {
            ResponseEntity.ok(itemService.getItemDTOById(id)); // Se anexarán las propiedades tal cual
        }

        return ResponseEntity.ok(itemService.getItemDTOById(id)); // Se anexarán CharacterItemProperties
    }

    // Actualizar ítem (admin)
    @PatchMapping("/{id}")
    public ResponseEntity<String> updateItem(@PathVariable Long id,
                                              @Valid @RequestBody ItemDTO dto,
                                              Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden editar ítems.");
        }
        itemService.updateItem(id, dto);
        return ResponseEntity.ok("Ítem actualizado");
    }

    // Eliminar ítem (admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteItem(@PathVariable Long id, Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden eliminar ítems.");
        }
        itemService.deleteItem(id);
        return ResponseEntity.ok("Ítem eliminado");
    }


    // Asociar propiedades a un ítem (admin)
    @PostMapping("/{itemId}/properties/add")
    public ResponseEntity<String> addPropertiesToItem(@PathVariable Long itemId,
                                                      @RequestBody ListOfIdsAndSourceDTO request,
                                                      Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden modificar ítems.");
        }

        itemService.addPropertiesToItem(itemId, request.getListOfIds());
        return ResponseEntity.ok("Propiedades añadidas al ítem.");
    }

    // Desasociar propiedades de un ítem (admin)
    @PutMapping("/{itemId}/properties/remove")
    public ResponseEntity<String> removePropertiesFromItem(@PathVariable Long itemId,
                                                           @RequestBody ListOfIdsAndSourceDTO request,
                                                           Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden modificar ítems.");
        }

        itemService.removePropertiesFromItem(itemId, request.getListOfIds());
        return ResponseEntity.ok("Propiedades eliminadas del ítem.");
    }

    // Actualizar datos de un CharacterItem (cantidad, equipado, currentUses, etc.)
    @PatchMapping("/character-items/{characterItemId}")
    public ResponseEntity<String> updateCharacterItem(@PathVariable Long characterItemId,
                                                      @Valid @RequestBody ItemDTO dto,
                                                      Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            Long characterId = itemService.getCharacterIdFromCharacterItem(characterItemId);
            characterService.verifyCharacterOwnership(characterId, auth.getName());
        }

        itemService.updateCharacterItem(characterItemId, dto);
        return ResponseEntity.ok("CharacterItem actualizado");
    }

    // Actualizar un CharacterItemProperty
    @PatchMapping("/character-item-properties/{characterItemPropertyId}")
    public ResponseEntity<String> updateCharacterItemProperty(@PathVariable Long characterItemPropertyId,
                                                              @Valid @RequestBody ItemPropertyDTO dto,
                                                              Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            Long characterId = itemService.getCharacterIdFromCharacterItemProperty(characterItemPropertyId);
            characterService.verifyCharacterOwnership(characterId, auth.getName());
        }

        itemService.updateCharacterItemProperty(characterItemPropertyId, dto);
        return ResponseEntity.ok("CharacterItemProperty actualizado");
    }


}
