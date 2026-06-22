package com.thesis.projectmanagement.mapper;

import com.thesis.projectmanagement.dto.EpicDTO;
import com.thesis.projectmanagement.model.Epic;
import com.thesis.projectmanagement.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EpicMapper {
    private final ProjectRepository projectRepository;
    
    public EpicDTO toDTO(Epic entity) {
        if (entity == null) {
            return null;
        }
        
        return EpicDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .projectId(entity.getProject() != null ? entity.getProject().getId() : null)
                .build();
    }
    
    public Epic toEntity(EpicDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Epic epic = Epic.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .build();

        if (dto.getProjectId() != null) {
            epic.setProject(projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + dto.getProjectId())));
        }
        
        return epic;
    }

    public void updateEntityFromDTO(EpicDTO dto, Epic entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        if (dto.getTitle() != null) {
            entity.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null) {
            entity.setDescription(dto.getDescription());
        }
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