package com.thesis.projectmanagement.mapper;

import com.thesis.projectmanagement.dto.CostDTO;
import com.thesis.projectmanagement.model.Cost;
import org.springframework.stereotype.Component;

@Component
public class CostMapper {
    
    public CostDTO toDTO(Cost entity) {
        if (entity == null) {
            return null;
        }
        
        return CostDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .amount(entity.getAmount())
                .category(entity.getCategory())
                .build();
    }
    
    public Cost toEntity(CostDTO dto) {
        if (dto == null) {
            return null;
        }
        
        return Cost.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .amount(dto.getAmount())
                .category(dto.getCategory())
                .build();
    }
    
    public void updateEntityFromDTO(CostDTO dto, Cost entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        if (dto.getName() != null) {
            entity.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            entity.setDescription(dto.getDescription());
        }
        if (dto.getAmount() != null) {
            entity.setAmount(dto.getAmount());
        }
        if (dto.getCategory() != null) {
            entity.setCategory(dto.getCategory());
        }
    }
} 