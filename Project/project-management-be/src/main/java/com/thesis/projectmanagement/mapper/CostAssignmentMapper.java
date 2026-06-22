package com.thesis.projectmanagement.mapper;

import com.thesis.projectmanagement.dto.CostAssignmentDTO;
import com.thesis.projectmanagement.model.CostAssignment;
import com.thesis.projectmanagement.repository.CostRepository;
import com.thesis.projectmanagement.repository.EpicRepository;
import com.thesis.projectmanagement.repository.WorkItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CostAssignmentMapper {
    private final CostRepository costRepository;
    private final EpicRepository epicRepository;
    private final WorkItemRepository workItemRepository;
    
    public CostAssignmentDTO toDTO(CostAssignment entity) {
        if (entity == null) {
            return null;
        }
        
        return CostAssignmentDTO.builder()
                .id(entity.getId())
                .costId(entity.getCost() != null ? entity.getCost().getId() : null)
                .epicId(entity.getEpic() != null ? entity.getEpic().getId() : null)
                .workItemId(entity.getWorkItem() != null ? entity.getWorkItem().getId() : null)
                .build();
    }
    
    public CostAssignment toEntity(CostAssignmentDTO dto) {
        if (dto == null) {
            return null;
        }
        
        CostAssignment assignment = new CostAssignment();
        assignment.setId(dto.getId());

        if (dto.getCostId() != null) {
            assignment.setCost(costRepository.findById(dto.getCostId())
                    .orElseThrow(() -> new IllegalArgumentException("Cost not found with id: " + dto.getCostId())));
        }
        
        if (dto.getEpicId() != null) {
            assignment.setEpic(epicRepository.findById(dto.getEpicId())
                    .orElseThrow(() -> new IllegalArgumentException("Epic not found with id: " + dto.getEpicId())));
        }
        
        if (dto.getWorkItemId() != null) {
            assignment.setWorkItem(workItemRepository.findById(dto.getWorkItemId())
                    .orElseThrow(() -> new IllegalArgumentException("WorkItem not found with id: " + dto.getWorkItemId())));
        }
        
        return assignment;
    }

    public void updateEntityFromDTO(CostAssignmentDTO dto, CostAssignment entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        if (dto.getCostId() != null) {
            entity.setCost(costRepository.findById(dto.getCostId())
                    .orElseThrow(() -> new IllegalArgumentException("Cost not found with id: " + dto.getCostId())));
        }
        
        if (dto.getEpicId() != null) {
            entity.setEpic(epicRepository.findById(dto.getEpicId())
                    .orElseThrow(() -> new IllegalArgumentException("Epic not found with id: " + dto.getEpicId())));
            entity.setWorkItem(null);
        } else if (dto.getWorkItemId() != null) {
            entity.setWorkItem(workItemRepository.findById(dto.getWorkItemId())
                    .orElseThrow(() -> new IllegalArgumentException("WorkItem not found with id: " + dto.getWorkItemId())));
            entity.setEpic(null);
        }
    }
} 