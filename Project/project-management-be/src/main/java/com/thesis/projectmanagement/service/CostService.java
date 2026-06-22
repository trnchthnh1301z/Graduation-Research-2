package com.thesis.projectmanagement.service;

import com.thesis.projectmanagement.dto.CostDTO;
import com.thesis.projectmanagement.mapper.CostMapper;
import com.thesis.projectmanagement.model.Cost;
import com.thesis.projectmanagement.repository.CostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CostService {
    private final CostRepository costRepository;
    private final CostMapper costMapper;

    public List<CostDTO> getAllCosts() {
        return costRepository.findAll().stream()
                .map(costMapper::toDTO)
                .collect(Collectors.toList());
    }

    public CostDTO getCostById(Long id) {
        return costRepository.findById(id)
                .map(costMapper::toDTO)
                .orElseThrow(() -> new IllegalArgumentException("Cost not found with id: " + id));
    }

    public List<CostDTO> getCostsByCategory(String category) {
        return costRepository.findByCategory(category).stream()
                .map(costMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CostDTO createCost(CostDTO costDTO) {
        validateAmount(costDTO.getAmount());
        Cost cost = costMapper.toEntity(costDTO);
        cost = costRepository.save(cost);
        return costMapper.toDTO(cost);
    }

    @Transactional
    public CostDTO updateCost(Long id, CostDTO costDTO) {
        Cost existingCost = costRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cost not found with id: " + id));
        
        if (costDTO.getAmount() != null) {
            validateAmount(costDTO.getAmount());
        }
        
        costMapper.updateEntityFromDTO(costDTO, existingCost);
        existingCost = costRepository.save(existingCost);
        return costMapper.toDTO(existingCost);
    }

    @Transactional
    public void deleteCost(Long id) {
        if (!costRepository.existsById(id)) {
            throw new IllegalArgumentException("Cost not found with id: " + id);
        }
        costRepository.deleteById(id);
    }

    private void validateAmount(Double amount) {
        if (amount != null && amount < 0) {
            throw new IllegalArgumentException("Cost amount cannot be negative");
        }
    }
} 