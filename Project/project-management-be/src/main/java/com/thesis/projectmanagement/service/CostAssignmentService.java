package com.thesis.projectmanagement.service;

import com.thesis.projectmanagement.dto.CostAssignmentDTO;
import com.thesis.projectmanagement.mapper.CostAssignmentMapper;
import com.thesis.projectmanagement.model.CostAssignment;
import com.thesis.projectmanagement.repository.CostAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CostAssignmentService {
    private final CostAssignmentRepository costAssignmentRepository;
    private final CostAssignmentMapper costAssignmentMapper;

    public List<CostAssignmentDTO> getAllCostAssignments() {
        return costAssignmentRepository.findAll().stream()
                .map(costAssignmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    public CostAssignmentDTO getCostAssignment(Long costId) {
        return costAssignmentRepository.findById(costId)
                .map(costAssignmentMapper::toDTO)
                .orElseThrow(() -> new IllegalArgumentException("CostAssignment not found"));
    }

    public List<CostAssignmentDTO> getCostAssignmentsByCostId(Long costId) {
        return costAssignmentRepository.findByCostId(costId).stream()
                .map(costAssignmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<CostAssignmentDTO> getCostAssignmentsByEpicId(Long epicId) {
        return costAssignmentRepository.findByEpicId(epicId).stream()
                .map(costAssignmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<CostAssignmentDTO> getCostAssignmentsByWorkItemId(Long workItemId) {
        return costAssignmentRepository.findByWorkItemId(workItemId).stream()
                .map(costAssignmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CostAssignmentDTO createCostAssignment(CostAssignmentDTO costAssignmentDTO) {
        validateMutualExclusivity(costAssignmentDTO);
        CostAssignment costAssignment = costAssignmentMapper.toEntity(costAssignmentDTO);
        costAssignment = costAssignmentRepository.save(costAssignment);
        return costAssignmentMapper.toDTO(costAssignment);
    }

    @Transactional
    public CostAssignmentDTO updateCostAssignment(Long costId, CostAssignmentDTO costAssignmentDTO) {
        validateMutualExclusivity(costAssignmentDTO);
        CostAssignment existingCostAssignment = costAssignmentRepository.findById(costId)
                .orElseThrow(() -> new IllegalArgumentException("CostAssignment not found"));
        
        costAssignmentMapper.updateEntityFromDTO(costAssignmentDTO, existingCostAssignment);
        existingCostAssignment = costAssignmentRepository.save(existingCostAssignment);
        return costAssignmentMapper.toDTO(existingCostAssignment);
    }

    @Transactional
    public void deleteCostAssignment(Long costId) {
        if (!costAssignmentRepository.existsById(costId)) {
            throw new IllegalArgumentException("CostAssignment not found");
        }
        costAssignmentRepository.deleteById(costId);
    }

    private void validateMutualExclusivity(CostAssignmentDTO dto) {
        if ((dto.getEpicId() == null && dto.getWorkItemId() == null) || 
            (dto.getEpicId() != null && dto.getWorkItemId() != null)) {
            throw new IllegalArgumentException("A cost must be assigned to either an epic or a work item, but not both");
        }
    }
} 