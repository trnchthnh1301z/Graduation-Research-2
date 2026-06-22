package com.thesis.projectmanagement.service;

import com.thesis.projectmanagement.constants.WorkItemLocation;
import com.thesis.projectmanagement.constants.WorkItemStatus;
import com.thesis.projectmanagement.dto.WorkItemDTO;
import com.thesis.projectmanagement.mapper.WorkItemMapper;
import com.thesis.projectmanagement.model.WorkItem;
import com.thesis.projectmanagement.repository.WorkItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkItemService {
    private final WorkItemRepository workItemRepository;
    private final WorkItemMapper workItemMapper;

    public List<WorkItemDTO> getAllWorkItems() {
        return workItemRepository.findAll().stream()
                .map(workItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    public WorkItemDTO getWorkItemById(Long id) {
        return workItemRepository.findById(id)
                .map(workItemMapper::toDTO)
                .orElseThrow(() -> new IllegalArgumentException("WorkItem not found with id: " + id));
    }

    public List<WorkItemDTO> getWorkItemsByProjectId(Long projectId) {
        return workItemRepository.findByProjectId(projectId).stream()
                .map(workItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<WorkItemDTO> getWorkItemsBySprintId(Long sprintId) {
        return workItemRepository.findBySprintId(sprintId).stream()
                .map(workItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<WorkItemDTO> getWorkItemsByEpicId(Long epicId) {
        return workItemRepository.findByEpicId(epicId).stream()
                .map(workItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<WorkItemDTO> getWorkItemsByProjectAndLocation(Long projectId, WorkItemLocation location) {
        return workItemRepository.findByProjectIdAndLocation(projectId, location).stream()
                .map(workItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<WorkItemDTO> getWorkItemsByProjectAndStatus(Long projectId, WorkItemStatus status) {
        return workItemRepository.findByProjectIdAndStatus(projectId, status).stream()
                .map(workItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkItemDTO createWorkItem(WorkItemDTO workItemDTO) {
        WorkItem workItem = workItemMapper.toEntity(workItemDTO);
        workItem = workItemRepository.save(workItem);
        return workItemMapper.toDTO(workItem);
    }

    @Transactional
    public WorkItemDTO updateWorkItem(Long id, WorkItemDTO workItemDTO) {
        WorkItem existingWorkItem = workItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("WorkItem not found with id: " + id));
        
        workItemMapper.updateEntityFromDTO(workItemDTO, existingWorkItem);
        existingWorkItem = workItemRepository.save(existingWorkItem);
        return workItemMapper.toDTO(existingWorkItem);
    }

    @Transactional
    public void deleteWorkItem(Long id) {
        if (!workItemRepository.existsById(id)) {
            throw new IllegalArgumentException("WorkItem not found with id: " + id);
        }
        workItemRepository.deleteById(id);
    }
} 