package com.rolup.backend.service;

import com.rolup.backend.dto.characterDTOs.CharacterDTO;
import com.rolup.backend.dto.characterDTOs.CharacterSummaryDTO;
import com.rolup.backend.exception.ForbiddenException;
import com.rolup.backend.exception.NotFoundException;
import com.rolup.backend.mapper.CharacterMapper;
import com.rolup.backend.model.Account;
import com.rolup.backend.model.Skill;
import com.rolup.backend.model.Spell;
import com.rolup.backend.model.character_related.*;
import com.rolup.backend.model.character_related.Character;
import com.rolup.backend.model.enums.Source;
import com.rolup.backend.model.item_related.Item;
import com.rolup.backend.model.item_related.ItemProperty;
import com.rolup.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CharacterService {

    private final SpellRepository spellRepository;
    private final ItemRepository itemRepository;
    private final SkillRepository skillRepository;
    private final CharacterRepository characterRepository;
    private final CharacterItemRepository characterItemRepository;
    private final AccountRepository accountRepository;

    @Autowired
    public CharacterService(SpellRepository spellRepository,
                            ItemRepository itemRepository,
                            SkillRepository skillRepository,
                            CharacterRepository characterRepository,
                            CharacterItemRepository characterItemRepository,
                            AccountRepository accountRepository) {
        this.spellRepository = spellRepository;
        this.itemRepository = itemRepository;
        this.skillRepository = skillRepository;
        this.characterRepository = characterRepository;
        this.characterItemRepository = characterItemRepository;
        this.accountRepository = accountRepository;
    }

    public CharacterDTO getCharacterById(Long characterId) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new NotFoundException("Personaje no encontrado"));
        return CharacterMapper.toDTO(character);
    }

    public List<CharacterSummaryDTO> getAllCharacters(String username, boolean isAdmin) {
        List<Character> characters = isAdmin
                ? characterRepository.findAll()
                : characterRepository.findByAccountUsername(username);

        return characters.stream()
                .map(character -> {
                    CharacterSummaryDTO dto = CharacterMapper.toSummaryDTO(character);
                    if (isAdmin) {
                        dto.setAccountUsername(character.getAccount().getUsername());
                    }
                    return dto;
                })
                .toList();
    }

    public CharacterDTO createCharacter(CharacterDTO dto, String username) {
        Account account;

        account = dto.getAccountId() != null
        ? accountRepository.findById(dto.getAccountId())
        .orElseThrow(() -> new NotFoundException("Cuenta de destino no encontrada"))
        : accountRepository.findByUsername(username)
        .orElseThrow(() -> new NotFoundException("Cuenta no encontrada"));

        // Crear entidad nueva y asignar solo nombre y cuenta
        Character character = new Character();
        character.setName(dto.getName());
        character.setAccount(account);

        // El resto de campos quedan por defecto
        characterRepository.save(character);

        return CharacterMapper.toDTO(character);
    }

    public void addSpellsToCharacter(Long characterId, List<Long> spellIds, Source source) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new NotFoundException("Personaje no encontrado"));

        List<Spell> spells = spellRepository.findAllById(spellIds);

        Set<Long> existingSpellIds = character.getCharacterSpells().stream()
                .map(cs -> cs.getSpell().getId())
                .collect(Collectors.toSet());

        for (Spell spell : spells) {
            if (!existingSpellIds.contains(spell.getId())) {
                CharacterSpell cs = new CharacterSpell();
                cs.setCharacter(character);
                cs.setSpell(spell);
                cs.setSource(source);
                cs.setPrepared(false);

                character.getCharacterSpells().add(cs);
            }
        }

        characterRepository.save(character);
    }

    public void removeSpellsFromCharacter(Long characterId, List<Long> spellIds) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new NotFoundException("Personaje no encontrado"));

        character.getCharacterSpells().removeIf(cs ->
                spellIds.contains(cs.getSpell().getId())
        );

        characterRepository.save(character);
    }

    public void addItemsToCharacter(Long characterId, List<Long> itemIds) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new NotFoundException("Personaje no encontrado"));

        List<Item> items = itemRepository.findAllById(itemIds);

        for (Item item : items) {
            // Verificar si el personaje ya tiene este ítem usando el repositorio
            Optional<CharacterItem> existingCharacterItemOpt = characterItemRepository
                    .findByCharacterIdAndItemId(characterId, item.getId());

            if (existingCharacterItemOpt.isPresent() && item.isStackable()) {
                // Si el ítem es stackable y ya existe, incrementar la cantidad
                CharacterItem existingCharacterItem = existingCharacterItemOpt.get();
                existingCharacterItem.setQuantity(existingCharacterItem.getQuantity() + 1);
                characterItemRepository.save(existingCharacterItem);
            } else {
                // Si no existe o no es stackable, crear un nuevo CharacterItem
                CharacterItem ci = new CharacterItem();
                ci.setCharacter(character);
                ci.setItem(item);
                ci.setCurrentUses(item.getMaxUses());
                ci.setQuantity(1);

                // Creamos un CharacterItemProperty para cada propiedad del item
                if (item.getProperties() != null) {
                    for (ItemProperty property : item.getProperties()) {
                        CharacterItemProperty cip = new CharacterItemProperty();
                        cip.setCharacterItem(ci);
                        cip.setProperty(property);
                        cip.setCurrentUses(property.getBaseMaxUses() != null ? property.getBaseMaxUses() : 0);
                        ci.getProperties().add(cip);
                    }
                }

                characterItemRepository.save(ci);
            }
        }
    }

    // Método auxiliar para buscar un CharacterItem por itemId en el personaje
    private CharacterItem findCharacterItemByItemId(Character character, Long itemId) {
        return character.getCharacterItems().stream()
                .filter(ci -> ci.getItem().getId().equals(itemId))
                .findFirst()
                .orElse(null);
    }

    public void removeItemsFromCharacter(Long characterId, List<Long> itemIds) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new NotFoundException("Personaje no encontrado"));

        character.getCharacterItems().removeIf(ci ->
                itemIds.contains(ci.getItem().getId())
        );

        characterRepository.save(character);
    }

    public void addSkillsToCharacter(Long characterId, List<Long> skillIds, Source source) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new NotFoundException("Personaje no encontrado"));

        List<Skill> skills = skillRepository.findAllById(skillIds);

        Set<Long> existingSkillIds = character.getExtraSkills().stream()
                .map(cs -> cs.getSkill().getId())
                .collect(Collectors.toSet());

        for (Skill skill : skills) {
            if (existingSkillIds.contains(skill.getId())) {
                continue; // Si ya existe, lo salteamos
            }

            CharacterSkill cs = new CharacterSkill();
            cs.setCharacter(character);
            cs.setSkill(skill);
            cs.setSource(source);
            cs.setCurrentUses(skill.getMaxUses());

            character.getExtraSkills().add(cs);
        }

        characterRepository.save(character);
    }

    public void removeSkillsFromCharacter(Long characterId, List<Long> skillIds) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new NotFoundException("Personaje no encontrado"));

        character.getExtraSkills().removeIf(cs ->
                skillIds.contains(cs.getSkill().getId())
        );

        characterRepository.save(character);
    }

    public void updateCharacter(Long characterId, CharacterDTO dto) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new NotFoundException("Personaje no encontrado"));

        CharacterMapper.updateEntity(character, dto);
        characterRepository.save(character);
    }

    public void deleteCharacter(Long characterId) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new NotFoundException("Personaje no encontrado"));

        characterRepository.delete(character);
    }

    public void verifyCharacterOwnership(Long characterId, String username) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new NotFoundException("Personaje no encontrado"));

        if (!character.getAccount().getUsername().equals(username)) {
            throw new ForbiddenException("No eres el propietario de este personaje");
        }
    }
}