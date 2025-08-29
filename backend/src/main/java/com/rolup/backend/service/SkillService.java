package com.rolup.backend.service;

import com.rolup.backend.dto.SkillDTO;
import com.rolup.backend.exception.NotFoundException;
import com.rolup.backend.mapper.SkillMapper;
import com.rolup.backend.model.Skill;
import com.rolup.backend.model.character_related.CharacterSkill;
import com.rolup.backend.repository.CharacterSkillRepository;
import com.rolup.backend.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SkillService {

    private final SkillRepository skillRepository;
    private final CharacterSkillRepository characterSkillRepository;

    @Autowired
    public SkillService(SkillRepository skillRepository, CharacterSkillRepository characterSkillRepository) {
        this.skillRepository = skillRepository;
        this.characterSkillRepository = characterSkillRepository;
    }

    public SkillDTO createSkill(SkillDTO dto) {
        Skill skill = SkillMapper.toEntity(dto);
        Skill saved = skillRepository.save(skill);
        return SkillMapper.toDTO(saved);
    }

    public List<SkillDTO> getAllSkillsForAdmin() {
        return skillRepository.findAll().stream()
                .map(SkillMapper::toDTO)
                .toList();
    }

    public List<SkillDTO> getSkillsForCharacter(Long characterId) {
        // 1. Obtener todas las relaciones del personaje con conjuros
        List<CharacterSkill> characterSpells = characterSkillRepository.findByCharacterId(characterId);

        // 2. Mapear a DTO incluyendo el origen
        return characterSpells.stream()
                .map(cs -> {
                    Skill skill = cs.getSkill();
                    SkillDTO dto = SkillMapper.toDTO(skill);

                    dto.setSource(String.valueOf(cs.getSource()));
                    dto.setCurrentUses(cs.getCurrentUses());

                    return dto;
                })
                .collect(Collectors.toList());
    }

    public SkillDTO getSkillDTOById(Long id) {
        Skill skill = getSkillById(id);
        return SkillMapper.toDTO(skill);
    }

    public Skill getSkillById(Long id) {
        return skillRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Habilidad no encontrada"));
    }

    public SkillDTO updateSkill(Long id, SkillDTO dto) {
        Skill existing = getSkillById(id);
        SkillMapper.updateEntity(existing, dto);
        Skill updated = skillRepository.save(existing);
        return SkillMapper.toDTO(updated);
    }

    public void deleteSkill(Long id) {
        if (!skillRepository.existsById(id)) {
            throw new NotFoundException("Habilidad no encontrada");
        }
        skillRepository.deleteById(id);
    }

    public boolean isSkillVisibleToCharacter(Long skillId, Long characterId) {
        Skill skill = getSkillById(skillId);
        return skill.getCharacterSkills().stream()
                .anyMatch(cs -> cs.getCharacter().getId().equals(characterId));
    }

    public void changeSkillCurrentUses(Long characterId, Long skillId, int uses) {
        // Buscar la relación CharacterSkill
        CharacterSkill characterSkill = characterSkillRepository.findByCharacterIdAndSkillId(characterId, skillId)
                .orElseThrow(() -> new NotFoundException("El personaje no tiene esta habilidad"));

        // Cambiar los usos
        characterSkill.setCurrentUses(uses);
        characterSkillRepository.save(characterSkill);
    }
}
