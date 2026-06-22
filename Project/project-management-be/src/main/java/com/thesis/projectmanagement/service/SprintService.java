package com.thesis.projectmanagement.service;

import com.thesis.projectmanagement.constants.SprintStatus;
import com.thesis.projectmanagement.dto.SprintDTO;
import com.thesis.projectmanagement.mapper.SprintMapper;
import com.thesis.projectmanagement.model.Sprint;
import com.thesis.projectmanagement.repository.SprintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SprintService {
    private final SprintRepository sprintRepository;
    private final SprintMapper sprintMapper;

    public List<SprintDTO> getAllSprints() {
        return sprintRepository.findAll().stream()
                .map(sprintMapper::toDTO)
                .collect(Collectors.toList());
    }

    public SprintDTO getSprintById(Long id) {
        return sprintRepository.findById(id)
                .map(sprintMapper::toDTO)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found with id: " + id));
    }

    public List<SprintDTO> getSprintsByProjectId(Long projectId) {
        return sprintRepository.findByProjectId(projectId).stream()
                .map(sprintMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<SprintDTO> getSprintsByProjectAndStatus(Long projectId, SprintStatus status) {
        return sprintRepository.findByProjectIdAndStatus(projectId, status).stream()
                .map(sprintMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public SprintDTO createSprint(SprintDTO sprintDTO) {
        Sprint sprint = sprintMapper.toEntity(sprintDTO);
        sprint = sprintRepository.save(sprint);
        sprint.setStatus(SprintStatus.NOT_STARTED);
        return sprintMapper.toDTO(sprint);
    }

    @Transactional
    public SprintDTO updateSprint(Long id, SprintDTO sprintDTO) {
        Sprint existingSprint = sprintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found with id: " + id));
        
        // Handle status transitions if status is being updated
        if (sprintDTO.getStatus() != null) {
            SprintStatus newStatus = SprintStatus.valueOf(sprintDTO.getStatus());
            SprintStatus currentStatus = existingSprint.getStatus();
            
            if (newStatus != currentStatus) {
                switch (newStatus) {
                    case ACTIVE:
                        existingSprint.startSprint();
                        break;
                    case COMPLETED:
                        existingSprint.completeSprint();
                        break;
                    case NOT_STARTED:
                        throw new IllegalStateException("Cannot move sprint back to NOT_STARTED status");
                    default:
                        throw new IllegalStateException("Unknown sprint status: " + newStatus);
                }
            }
            // Remove status from DTO to prevent direct status update
            sprintDTO.setStatus(null);
        }
        
        // Update other fields
        sprintMapper.updateEntityFromDTO(sprintDTO, existingSprint);
        existingSprint = sprintRepository.save(existingSprint);
        return sprintMapper.toDTO(existingSprint);
    }

    @Transactional
    public void deleteSprint(Long id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found with id: " + id));
                
        if (sprint.getStatus() != SprintStatus.NOT_STARTED) {
            throw new IllegalStateException("Can only delete sprints that haven't started");
        }
        
        sprintRepository.deleteById(id);
    }

    @Transactional
    public SprintDTO startSprint(Long id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found with id: " + id));
        sprint.startSprint();
        sprint = sprintRepository.save(sprint);
        return sprintMapper.toDTO(sprint);
    }

    @Transactional
    public SprintDTO completeSprint(Long id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found with id: " + id));
        sprint.completeSprint();
        sprint = sprintRepository.save(sprint);
        return sprintMapper.toDTO(sprint);
    }

    @Transactional
    public SprintDTO completeSprint(Long id, Long targetSprintId) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found with id: " + id));
        
        Sprint targetSprint = sprintRepository.findById(targetSprintId)
                .orElseThrow(() -> new IllegalArgumentException("Target sprint not found with id: " + targetSprintId));
        
        sprint.completeSprint(targetSprint);
        sprint = sprintRepository.save(sprint);
        return sprintMapper.toDTO(sprint);
    }
} 