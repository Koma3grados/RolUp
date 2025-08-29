package com.rolup.backend.service;

import com.rolup.backend.dto.itemDTOs.ItemDTO;
import com.rolup.backend.dto.itemDTOs.ItemPropertyDTO;
import com.rolup.backend.exception.NotFoundException;
import com.rolup.backend.mapper.ItemMapper;
import com.rolup.backend.model.character_related.CharacterItem;
import com.rolup.backend.model.character_related.CharacterItemProperty;
import com.rolup.backend.model.enums.ItemCategory;
import com.rolup.backend.model.item_related.Armor;
import com.rolup.backend.model.item_related.Item;
import com.rolup.backend.model.item_related.ItemProperty;
import com.rolup.backend.model.item_related.Weapon;
import com.rolup.backend.repository.CharacterItemPropertyRepository;
import com.rolup.backend.repository.CharacterItemRepository;
import com.rolup.backend.repository.ItemPropertyRepository;
import com.rolup.backend.repository.ItemRepository;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.rolup.backend.mapper.ItemPropertyMapper;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemPropertyRepository itemPropertyRepository;
    private final CharacterItemRepository characterItemRepository;
    private final CharacterItemPropertyRepository characterItemPropertyRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    public ItemService(ItemRepository itemRepository,
                       ItemPropertyRepository itemPropertyRepository,
                       CharacterItemRepository characterItemRepository,
                       CharacterItemPropertyRepository characterItemPropertyRepository) {
        this.itemRepository = itemRepository;
        this.itemPropertyRepository = itemPropertyRepository;
        this.characterItemRepository = characterItemRepository;
        this.characterItemPropertyRepository = characterItemPropertyRepository;
    }

    // Este método debe revisarse
    public boolean isItemVisibleToCharacter(Long itemId, Long characterId) {
        return itemRepository.existsByCharacterIdAndItemId(characterId, itemId);
    }

    public ItemDTO createItem(ItemDTO dto) {
        Item item = ItemMapper.toEntity(dto);
        return ItemMapper.toDTO(itemRepository.save(item));
    }

    public List<ItemDTO> getAllItems() {
        return itemRepository.findAll().stream()
                .map(item -> {
                    ItemDTO dto = ItemMapper.toDTO(item);
                    // Mapear las propiedades base del ítem
                    List<ItemPropertyDTO> propertyDTOs = item.getProperties().stream()
                            .map(ItemPropertyMapper::toDTO)
                            .toList();
                    dto.setPropertyDTOList(propertyDTOs);
                    return dto;
                })
                .toList();
    }

    public List<ItemDTO> getAllItemsForCharacter(Long characterId) {
        List<CharacterItem> characterItems = characterItemRepository.findByCharacterId(characterId);

        return characterItems.stream()
                .map(ci -> {
                    // Base: datos del Item
                    ItemDTO dto = ItemMapper.toDTO(ci.getItem());

                    // Datos específicos de CharacterItem
                    dto.setId(ci.getId()); // No es el id del Item, sino del CharacterItem
                    dto.setCurrentUses(ci.getCurrentUses());
                    dto.setQuantity(ci.getQuantity());
                    dto.setEquipped(ci.isEquipped());
                    dto.setAttuned(ci.isAttuned());

                    // Propiedades: datos del Item + CharacterItemProperty
                    List<ItemPropertyDTO> propertyDTOs = ci.getItem().getProperties().stream()
                            .map(property -> {
                                ItemPropertyDTO propDTO = ItemPropertyMapper.toDTO(property);
                                characterItemPropertyRepository
                                        .findByCharacterItemAndProperty(ci, property)
                                        .ifPresent(charItemProp -> {
                                            propDTO.setId(charItemProp.getId()); // usamos ID de CharacterItemProperty
                                            propDTO.setCurrentUses(charItemProp.getCurrentUses());
                                        });
                                return propDTO;
                            })
                            .toList();

                    dto.setPropertyDTOList(propertyDTOs);
                    return dto;
                })
                .toList();
    }


    public ItemDTO getItemDTOById(Long id) { return ItemMapper.toDTO(getItemById(id)); }

    public Item getItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Ítem no encontrado"));
    }

    @Transactional
    public void updateItem(Long id, ItemDTO dto) {
        // 1) Cargar el item existente
        Item existingItem = itemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Ítem no encontrado"));

        // 2) Verificar si la categoría ha cambiado
        boolean categoryChanged = !existingItem.getCategory().equals(dto.getCategory());

        // 3) Actualizar campos comunes (sin tocar propiedades)
        ItemMapper.updateEntity(existingItem, dto);

        // 4) Manejar el cambio de categoría si es necesario
        if (categoryChanged) {
            // Eliminar de la subtabla actual según la categoría anterior
            if (existingItem.getCategory() == ItemCategory.WEAPON) {
                entityManager.createNativeQuery("DELETE FROM weapons WHERE id = :id")
                        .setParameter("id", id).executeUpdate();
            } else if (existingItem.getCategory() == ItemCategory.ARMOR) {
                entityManager.createNativeQuery("DELETE FROM armors WHERE id = :id")
                        .setParameter("id", id).executeUpdate();
            }

            // Insertar en la nueva subtabla según la nueva categoría
            if (dto.getCategory() == ItemCategory.WEAPON) {
                entityManager.createNativeQuery(
                                "INSERT INTO weapons (id, damage, range) VALUES (:id, :damage, :range)")
                        .setParameter("id", id)
                        .setParameter("damage", dto.getDamage())
                        .setParameter("range", dto.getRange())
                        .executeUpdate();
            } else if (dto.getCategory() == ItemCategory.ARMOR) {
                entityManager.createNativeQuery(
                                "INSERT INTO armors (id, armor_class_formula) VALUES (:id, :acf)")
                        .setParameter("id", id)
                        .setParameter("acf", dto.getArmorClassFormula())
                        .executeUpdate();
            }

            // Limpiar el contexto para evitar entidades cacheadas del tipo antiguo
            entityManager.clear();

            // Recargar el item con el tipo correcto después del cambio
            existingItem = itemRepository.findById(id)
                    .orElseThrow(() -> new NotFoundException("Ítem no encontrado después del cambio de categoría"));
        } else {
            // Si la categoría no cambió, actualizar campos específicos normalmente
            if (existingItem instanceof Weapon weapon) {
                if (dto.getDamage() != null) weapon.setDamage(dto.getDamage());
                if (dto.getRange() != null) weapon.setRange(dto.getRange());
            } else if (existingItem instanceof Armor armor) {
                if (dto.getArmorClassFormula() != null) armor.setArmorClassFormula(dto.getArmorClassFormula());
            }
        }

        // 5) Guardar el item (las propiedades se mantienen intactas)
        itemRepository.save(existingItem);
    }


    public void deleteItem(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new NotFoundException("Ítem no encontrado");
        }
        itemRepository.deleteById(id);
    }

    // Propiedades
    public void addPropertiesToItem(Long itemId, List<Long> propertyIds) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Ítem no encontrado"));

        // Obtener IDs de propiedades ya existentes
        Set<Long> existingPropertyIds = item.getProperties().stream()
                .map(ItemProperty::getId)
                .collect(Collectors.toSet());

        // Filtrar solo los IDs que no existen
        List<Long> newPropertyIds = propertyIds.stream()
                .filter(id -> !existingPropertyIds.contains(id))
                .toList();

        if (!newPropertyIds.isEmpty()) {
            List<ItemProperty> propertiesToAdd = itemPropertyRepository.findAllById(newPropertyIds);
            item.getProperties().addAll(propertiesToAdd);
            itemRepository.save(item);

            // Actualizar todos los CharacterItem existentes que tengan este ítem
            updateExistingCharacterItemsWithNewProperties(itemId, propertiesToAdd);
        }
    }

    private void updateExistingCharacterItemsWithNewProperties(Long itemId, List<ItemProperty> newProperties) {
        // Obtener todos los CharacterItem que tienen este ítem
        List<CharacterItem> characterItems = characterItemRepository.findByItemId(itemId);

        for (CharacterItem characterItem : characterItems) {
            // Para cada nueva propiedad, crear un CharacterItemProperty
            for (ItemProperty property : newProperties) {
                // Verificar si el CharacterItem ya tiene esta propiedad
                boolean propertyExists = characterItem.getProperties().stream()
                        .anyMatch(cip -> cip.getProperty().getId().equals(property.getId()));

                if (!propertyExists) {
                    CharacterItemProperty cip = new CharacterItemProperty();
                    cip.setCharacterItem(characterItem);
                    cip.setProperty(property);
                    cip.setCurrentUses(property.getBaseMaxUses() != null ? property.getBaseMaxUses() : 0);
                    characterItem.getProperties().add(cip);
                }
            }
            characterItemRepository.save(characterItem);
        }
    }

    public void removePropertiesFromItem(Long itemId, List<Long> propertyIds) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Ítem no encontrado"));

        item.getProperties().removeIf(prop -> propertyIds.contains(prop.getId()));

        itemRepository.save(item);
    }



    // Verifica si el ítem pertenece al personaje
    public boolean belongsToCharacter(Long characterItemId, Long characterId) {
        return !characterItemRepository.existsByIdAndCharacterId(characterItemId, characterId);
    }

    // CharacterItem
    public Long getCharacterIdFromCharacterItem(Long characterItemId) {
        CharacterItem characterItem = characterItemRepository.findById(characterItemId)
                .orElseThrow(() -> new NotFoundException("CharacterItem no encontrado"));
        return characterItem.getCharacter().getId();
    }

    public Long getCharacterIdFromCharacterItemProperty(Long characterItemPropertyId) {
        CharacterItemProperty characterItemProperty = characterItemPropertyRepository.findById(characterItemPropertyId)
                .orElseThrow(() -> new NotFoundException("CharacterItemProperty no encontrado"));
        return characterItemProperty.getCharacterItem().getCharacter().getId();
    }

    public void updateCharacterItem(Long characterItemId, ItemDTO dto) {
        CharacterItem characterItem = characterItemRepository.findById(characterItemId)
                .orElseThrow(() -> new NotFoundException("CharacterItem no encontrado"));

        // Actualizar campos que pueden cambiar desde el DTO
        if (dto.getCurrentUses() != null) {
            characterItem.setCurrentUses(dto.getCurrentUses());
        }
        if (dto.getQuantity() != null) {
            characterItem.setQuantity(dto.getQuantity());
        }
        if (dto.getEquipped() != null) {
            characterItem.setEquipped(dto.getEquipped());
        }
        if (dto.getAttuned() != null) {
            characterItem.setAttuned(dto.getAttuned());
        }

        characterItemRepository.save(characterItem);
    }

    public void updateCharacterItemProperty(Long characterItemPropertyId, ItemPropertyDTO dto) {
        CharacterItemProperty characterItemProperty = characterItemPropertyRepository.findById(characterItemPropertyId)
                .orElseThrow(() -> new NotFoundException("CharacterItemProperty no encontrado"));

        // Solo actualizar currentUses (según lo que comentaste)
        if (dto.getCurrentUses() != null) {
            characterItemProperty.setCurrentUses(dto.getCurrentUses());
        }

        characterItemPropertyRepository.save(characterItemProperty);
    }

}
