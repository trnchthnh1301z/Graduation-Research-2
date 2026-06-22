package com.thesis.projectmanagement.mapper;

import com.thesis.projectmanagement.dto.SprintDTO;
import com.thesis.projectmanagement.model.Sprint;
import com.thesis.projectmanagement.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SprintMapper {
    private final ProjectRepository projectRepository;
    
    public SprintDTO toDTO(Sprint entity) {
        if (entity == null) {
            return null;
        }
        
        return SprintDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .goal(entity.getGoal())
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .projectId(entity.getProject() != null ? entity.getProject().getId() : null)
                .build();
    }
    
    public Sprint toEntity(SprintDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Sprint sprint = Sprint.builder()
                .id(dto.getId())
                .name(dto.getName())
                .goal(dto.getGoal())
                // Status is handled by the service layer
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .build();

        if (dto.getProjectId() != null) {
            sprint.setProject(projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + dto.getProjectId())));
        }
        
        return sprint;
    }

    public void updateEntityFromDTO(SprintDTO dto, Sprint entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        if (dto.getName() != null) {
            entity.setName(dto.getName());
        }
        if (dto.getGoal() != null) {
            entity.setGoal(dto.getGoal());
        }
        // Status changes are handled by the service layer
        if (dto.getStartDate() != null) {
            entity.setStartDate(dto.getStartDate());
        }
        if (dto.getEndDate() != null) {
            entity.setEndDate(dto.getEndDate());
        }
        
        if (dto.getProjectId() != null) {
            entity.setProject(projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + dto.getProjectId())));
        }
    }
} 