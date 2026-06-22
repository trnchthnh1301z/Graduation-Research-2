package com.thesis.projectmanagement.mapper;

import com.thesis.projectmanagement.constants.ProjectStatus;
import com.thesis.projectmanagement.dto.ProjectDTO;
import com.thesis.projectmanagement.model.Project;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {
    
    public ProjectDTO toDTO(Project entity) {
        if (entity == null) {
            return null;
        }
        
        return ProjectDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .build();
    }
    
    public Project toEntity(ProjectDTO dto) {
        if (dto == null) {
            return null;
        }
        
        return Project.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(dto.getStatus() != null ? ProjectStatus.valueOf(dto.getStatus()) : null)
                .build();
    }
    
    public void updateEntityFromDTO(ProjectDTO dto, Project entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        if (dto.getTitle() != null) {
            entity.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null) {
            entity.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null) {
            entity.setStatus(ProjectStatus.valueOf(dto.getStatus()));
        }
    }
} 