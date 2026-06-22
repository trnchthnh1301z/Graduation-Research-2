package com.thesis.projectmanagement.mapper;

import com.thesis.projectmanagement.constants.WorkItemLocation;
import com.thesis.projectmanagement.constants.WorkItemPriority;
import com.thesis.projectmanagement.constants.WorkItemStatus;
import com.thesis.projectmanagement.constants.WorkItemType;
import com.thesis.projectmanagement.dto.WorkItemDTO;
import com.thesis.projectmanagement.model.WorkItem;
import com.thesis.projectmanagement.repository.EpicRepository;
import com.thesis.projectmanagement.repository.ProjectRepository;
import com.thesis.projectmanagement.repository.SprintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WorkItemMapper {
    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final EpicRepository epicRepository;
    
    public WorkItemDTO toDTO(WorkItem entity) {
        if (entity == null) {
            return null;
        }
        
        return WorkItemDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .priority(entity.getPriority() != null ? entity.getPriority().name() : null)
                .type(entity.getType() != null ? entity.getType().name() : null)
                .location(entity.getLocation() != null ? entity.getLocation().name() : null)
                .storyPoints(entity.getStoryPoints())
                .sprintId(entity.getSprint() != null ? entity.getSprint().getId() : null)
                .projectId(entity.getProject() != null ? entity.getProject().getId() : null)
                .epicId(entity.getEpic() != null ? entity.getEpic().getId() : null)
                .build();
    }
    
    public WorkItem toEntity(WorkItemDTO dto) {
        if (dto == null) {
            return null;
        }
        
        WorkItem workItem = WorkItem.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(dto.getStatus() != null ? WorkItemStatus.valueOf(dto.getStatus()) : null)
                .priority(dto.getPriority() != null ? WorkItemPriority.valueOf(dto.getPriority()) : null)
                .type(dto.getType() != null ? WorkItemType.valueOf(dto.getType()) : null)
                .location(dto.getLocation() != null ? WorkItemLocation.valueOf(dto.getLocation()) : WorkItemLocation.BACKLOG)
                .storyPoints(dto.getStoryPoints())
                .build();

        if (dto.getProjectId() != null) {
            workItem.setProject(projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + dto.getProjectId())));
        }
        
        if (dto.getSprintId() != null) {
            workItem.setSprint(sprintRepository.findById(dto.getSprintId())
                    .orElseThrow(() -> new IllegalArgumentException("Sprint not found with id: " + dto.getSprintId())));
        }
        
        if (dto.getEpicId() != null) {
            workItem.setEpic(epicRepository.findById(dto.getEpicId())
                    .orElseThrow(() -> new IllegalArgumentException("Epic not found with id: " + dto.getEpicId())));
        }
        
        return workItem;
    }

    public void updateEntityFromDTO(WorkItemDTO dto, WorkItem entity) {
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
            entity.setStatus(WorkItemStatus.valueOf(dto.getStatus()));
        }
        if (dto.getPriority() != null) {
            entity.setPriority(WorkItemPriority.valueOf(dto.getPriority()));
        }
        if (dto.getType() != null) {
            entity.setType(WorkItemType.valueOf(dto.getType()));
        }
        if (dto.getLocation() != null) {
            entity.setLocation(WorkItemLocation.valueOf(dto.getLocation()));
        }
        if (dto.getStoryPoints() != null) {
            entity.setStoryPoints(dto.getStoryPoints());
        }
        
        if (dto.getProjectId() != null) {
            entity.setProject(projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + dto.getProjectId())));
        }
        
        if (dto.getSprintId() != null) {
            entity.setSprint(sprintRepository.findById(dto.getSprintId())
                    .orElseThrow(() -> new IllegalArgumentException("Sprint not found with id: " + dto.getSprintId())));
        } else {
            entity.setSprint(null);
        }
        
        if (dto.getEpicId() != null) {
            entity.setEpic(epicRepository.findById(dto.getEpicId())
                    .orElseThrow(() -> new IllegalArgumentException("Epic not found with id: " + dto.getEpicId())));
        } else {
            entity.setEpic(null);
        }
    }
} 