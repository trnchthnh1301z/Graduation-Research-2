package com.thesis.projectmanagement.mapper;

import com.thesis.projectmanagement.dto.PersonAssignmentDTO;
import com.thesis.projectmanagement.model.PersonAssignment;
import com.thesis.projectmanagement.repository.EpicRepository;
import com.thesis.projectmanagement.repository.PersonRepository;
import com.thesis.projectmanagement.repository.WorkItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PersonAssignmentMapper {
    private final PersonRepository personRepository;
    private final EpicRepository epicRepository;
    private final WorkItemRepository workItemRepository;
    
    public PersonAssignmentDTO toDTO(PersonAssignment entity) {
        if (entity == null) {
            return null;
        }
        
        return PersonAssignmentDTO.builder()
                .id(entity.getId())
                .personId(entity.getPerson() != null ? entity.getPerson().getId() : null)
                .epicId(entity.getEpic() != null ? entity.getEpic().getId() : null)
                .workItemId(entity.getWorkItem() != null ? entity.getWorkItem().getId() : null)
                .hours(entity.getHours())
                .description(entity.getDescription())
                .build();
    }
    
    public PersonAssignment toEntity(PersonAssignmentDTO dto) {
        if (dto == null) {
            return null;
        }
        
        PersonAssignment assignment = new PersonAssignment();
        assignment.setId(dto.getId());
        
        if (dto.getPersonId() != null) {
            assignment.setPerson(personRepository.findById(dto.getPersonId())
                    .orElseThrow(() -> new IllegalArgumentException("Person not found with id: " + dto.getPersonId())));
        }
        
        if (dto.getEpicId() != null) {
            assignment.setEpic(epicRepository.findById(dto.getEpicId())
                    .orElseThrow(() -> new IllegalArgumentException("Epic not found with id: " + dto.getEpicId())));
        }
        
        if (dto.getWorkItemId() != null) {
            assignment.setWorkItem(workItemRepository.findById(dto.getWorkItemId())
                    .orElseThrow(() -> new IllegalArgumentException("WorkItem not found with id: " + dto.getWorkItemId())));
        }
        
        assignment.setHours(dto.getHours());
        assignment.setDescription(dto.getDescription());
        
        return assignment;
    }

    public void updateEntityFromDTO(PersonAssignmentDTO dto, PersonAssignment entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        if (dto.getPersonId() != null) {
            entity.setPerson(personRepository.findById(dto.getPersonId())
                    .orElseThrow(() -> new IllegalArgumentException("Person not found with id: " + dto.getPersonId())));
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

        if (dto.getHours() != null) {
            entity.setHours(dto.getHours());
        }
        
        if (dto.getDescription() != null) {
            entity.setDescription(dto.getDescription());
        }
    }
} 