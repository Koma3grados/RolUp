package com.rolup.backend.service;

import com.rolup.backend.dto.SpellDTO;
import com.rolup.backend.exception.NotFoundException;
import com.rolup.backend.mapper.SpellMapper;
import com.rolup.backend.model.Spell;
import com.rolup.backend.model.character_related.CharacterSpell;
import com.rolup.backend.repository.CharacterSpellRepository;
import com.rolup.backend.repository.SpellRepository;
import com.rolup.backend.repository.CharacterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SpellService {

    private final SpellRepository spellRepository;
    private final CharacterSpellRepository characterSpellRepository;

    @Autowired
    public SpellService(SpellRepository spellRepository, CharacterRepository characterRepository, CharacterSpellRepository characterSpellRepository) {
        this.spellRepository = spellRepository;
        this.characterSpellRepository = characterSpellRepository;
    }

    public SpellDTO createSpell(SpellDTO dto) {
        Spell spell = SpellMapper.toEntity(dto);
        Spell saved = spellRepository.save(spell);
        return SpellMapper.toDTO(saved);
    }

    public List<SpellDTO> getAllSpellsForAdmin() {
        return spellRepository.findAll().stream()
                .map(SpellMapper::toDTO)
                .toList();
    }

    public List<SpellDTO> getSpellsForCharacter(Long characterId) {
        // 1. Obtener todas las relaciones del personaje con conjuros
        List<CharacterSpell> characterSpells = characterSpellRepository.findByCharacterId(characterId);

        // 2. Mapear a DTO incluyendo el origen
        return characterSpells.stream()
                .map(cs -> {
                    Spell spell = cs.getSpell();
                    SpellDTO dto = SpellMapper.toDTO(spell);

                    dto.setSource(String.valueOf(cs.getSource()));
                    dto.setPrepared(cs.isPrepared());
                    dto.setFavourite(cs.isFavourite());

                    return dto;
                })
                .collect(Collectors.toList());
    }

    public SpellDTO getSpellDTOById(Long id) {
        Spell spell = getSpellById(id);
        return SpellMapper.toDTO(spell);
    }

    public Spell getSpellById(Long id) {
        return spellRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Conjuro no encontrado"));
    }

    public SpellDTO updateSpell(Long id, SpellDTO dto) {
        Spell existing = getSpellById(id);
        SpellMapper.updateEntity(existing, dto);
        Spell updated = spellRepository.save(existing);
        return SpellMapper.toDTO(updated);
    }

    public void toggleSpellPreparedStatus(Long characterId, Long spellId) {
        // Buscar la relación CharacterSpell
        CharacterSpell characterSpell = characterSpellRepository.findByCharacterIdAndSpellId(characterId, spellId)
                .orElseThrow(() -> new NotFoundException("El personaje no tiene este conjuro"));

        // Alternar el estado
        characterSpell.setPrepared(!characterSpell.isPrepared());
        characterSpellRepository.save(characterSpell);
    }

    public void toggleSpellFavouriteStatus(Long characterId, Long spellId) {
        // Buscar la relación CharacterSpell
        CharacterSpell characterSpell = characterSpellRepository.findByCharacterIdAndSpellId(characterId, spellId)
                .orElseThrow(() -> new NotFoundException("El personaje no tiene este conjuro"));

        // Alternar el estado
        characterSpell.setFavourite(!characterSpell.isFavourite());
        characterSpellRepository.save(characterSpell);
    }

    public void deleteSpell(Long id) {
        if (!spellRepository.existsById(id)) {
            throw new NotFoundException("Conjuro no encontrado");
        }
        spellRepository.deleteById(id);
    }

    public boolean isSpellVisibleToCharacter(Long spellId, Long characterId) {
        Spell spell = getSpellById(spellId);
        return spell.getCharacterSpells().stream()
                .anyMatch(cs -> cs.getCharacter().getId().equals(characterId));
    }
}
