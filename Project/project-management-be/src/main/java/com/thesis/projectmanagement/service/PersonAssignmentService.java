package com.thesis.projectmanagement.service;

import com.thesis.projectmanagement.dto.PersonAssignmentDTO;
import com.thesis.projectmanagement.mapper.PersonAssignmentMapper;
import com.thesis.projectmanagement.model.PersonAssignment;
import com.thesis.projectmanagement.repository.PersonAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PersonAssignmentService {
    private final PersonAssignmentRepository personAssignmentRepository;
    private final PersonAssignmentMapper personAssignmentMapper;

    public List<PersonAssignmentDTO> getAllPersonAssignments() {
        return personAssignmentRepository.findAll().stream()
                .map(personAssignmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    public PersonAssignmentDTO getPersonAssignment(Long id) {
        return personAssignmentRepository.findById(id)
                .map(personAssignmentMapper::toDTO)
                .orElseThrow(() -> new IllegalArgumentException("PersonAssignment not found"));
    }

    public List<PersonAssignmentDTO> getPersonAssignmentsByPersonId(Long personId) {
        return personAssignmentRepository.findByPersonId(personId).stream()
                .map(personAssignmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<PersonAssignmentDTO> getPersonAssignmentsByEpicId(Long epicId) {
        return personAssignmentRepository.findByEpicId(epicId).stream()
                .map(personAssignmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<PersonAssignmentDTO> getPersonAssignmentsByWorkItemId(Long workItemId) {
        return personAssignmentRepository.findByWorkItemId(workItemId).stream()
                .map(personAssignmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PersonAssignmentDTO createPersonAssignment(PersonAssignmentDTO personAssignmentDTO) {
        validateMutualExclusivity(personAssignmentDTO);
        PersonAssignment personAssignment = personAssignmentMapper.toEntity(personAssignmentDTO);
        personAssignment = personAssignmentRepository.save(personAssignment);
        return personAssignmentMapper.toDTO(personAssignment);
    }

    @Transactional
    public PersonAssignmentDTO updatePersonAssignment(Long id, PersonAssignmentDTO personAssignmentDTO) {
        validateMutualExclusivity(personAssignmentDTO);
        PersonAssignment existingPersonAssignment = personAssignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PersonAssignment not found"));
        
        personAssignmentMapper.updateEntityFromDTO(personAssignmentDTO, existingPersonAssignment);
        existingPersonAssignment = personAssignmentRepository.save(existingPersonAssignment);
        return personAssignmentMapper.toDTO(existingPersonAssignment);
    }

    @Transactional
    public void deletePersonAssignment(Long id) {
        if (!personAssignmentRepository.existsById(id)) {
            throw new IllegalArgumentException("PersonAssignment not found");
        }
        personAssignmentRepository.deleteById(id);
    }

    private void validateMutualExclusivity(PersonAssignmentDTO dto) {
        if ((dto.getEpicId() == null && dto.getWorkItemId() == null) || 
            (dto.getEpicId() != null && dto.getWorkItemId() != null)) {
            throw new IllegalArgumentException("A person must be assigned to either an epic or a work item, but not both");
        }
        if (dto.getHours() != null && dto.getHours() < 0) {
            throw new IllegalArgumentException("Hours cannot be negative");
        }
    }
} 