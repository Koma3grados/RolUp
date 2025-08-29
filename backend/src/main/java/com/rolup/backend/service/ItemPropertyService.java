package com.rolup.backend.service;

import com.rolup.backend.dto.itemDTOs.ItemPropertyDTO;
import com.rolup.backend.exception.NotFoundException;
import com.rolup.backend.mapper.ItemPropertyMapper;
import com.rolup.backend.model.item_related.ItemProperty;
import com.rolup.backend.repository.ItemPropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemPropertyService {

    private final ItemPropertyRepository itemPropertyRepository;

    @Autowired
    public ItemPropertyService(ItemPropertyRepository itemPropertyRepository) {
        this.itemPropertyRepository = itemPropertyRepository;
    }

    public ItemPropertyDTO create(ItemPropertyDTO dto) {
        ItemProperty property = ItemPropertyMapper.toEntity(dto);
        ItemProperty saved = itemPropertyRepository.save(property);
        return ItemPropertyMapper.toDTO(saved);
    }

    public List<ItemPropertyDTO> getAll() {
        return itemPropertyRepository.findAll().stream()
                .map(ItemPropertyMapper::toDTO)
                .toList();
    }

    public ItemPropertyDTO getById(Long id) {
        ItemProperty property = itemPropertyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Propiedad de ítem no encontrada"));
        return ItemPropertyMapper.toDTO(property);
    }

    public ItemPropertyDTO update(Long id, ItemPropertyDTO dto) {
        ItemProperty existing = itemPropertyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Propiedad de ítem no encontrada"));

        ItemPropertyMapper.updateEntity(existing, dto);
        ItemProperty updated = itemPropertyRepository.save(existing);
        return ItemPropertyMapper.toDTO(updated);
    }

    public void delete(Long id) {
        if (!itemPropertyRepository.existsById(id)) {
            throw new NotFoundException("Propiedad de ítem no encontrada");
        }
        itemPropertyRepository.deleteById(id);
    }
}
