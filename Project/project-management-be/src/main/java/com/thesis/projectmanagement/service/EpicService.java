package com.thesis.projectmanagement.service;

import com.thesis.projectmanagement.dto.EpicDTO;
import com.thesis.projectmanagement.mapper.EpicMapper;
import com.thesis.projectmanagement.model.Epic;
import com.thesis.projectmanagement.model.WorkItem;
import com.thesis.projectmanagement.model.CostAssignment;
import com.thesis.projectmanagement.model.PersonAssignment;
import com.thesis.projectmanagement.repository.EpicRepository;
import com.thesis.projectmanagement.repository.WorkItemRepository;
import com.thesis.projectmanagement.repository.CostAssignmentRepository;
import com.thesis.projectmanagement.repository.PersonAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EpicService {
    private final EpicRepository epicRepository;
    private final EpicMapper epicMapper;
    private final WorkItemRepository workItemRepository;
    private final CostAssignmentRepository costAssignmentRepository;
    private final PersonAssignmentRepository personAssignmentRepository;

    public List<EpicDTO> getAllEpics() {
        return epicRepository.findAll().stream()
                .map(epicMapper::toDTO)
                .collect(Collectors.toList());
    }

    public EpicDTO getEpicById(Long id) {
        return epicRepository.findById(id)
                .map(epicMapper::toDTO)
                .orElseThrow(() -> new IllegalArgumentException("Epic not found with id: " + id));
    }

    public List<EpicDTO> getEpicsByProjectId(Long projectId) {
        return epicRepository.findByProjectId(projectId).stream()
                .map(epicMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EpicDTO createEpic(EpicDTO epicDTO) {
        Epic epic = epicMapper.toEntity(epicDTO);
        epic = epicRepository.save(epic);
        return epicMapper.toDTO(epic);
    }

    @Transactional
    public EpicDTO updateEpic(Long id, EpicDTO epicDTO) {
        Epic existingEpic = epicRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Epic not found with id: " + id));

        epicMapper.updateEntityFromDTO(epicDTO, existingEpic);
        existingEpic = epicRepository.save(existingEpic);
        return epicMapper.toDTO(existingEpic);
    }

    @Transactional
    public void deleteEpic(Long id) {
        Epic epic = epicRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Epic not found with id: " + id));

        // Remove epic reference from work items
        List<WorkItem> workItems = workItemRepository.findByEpicId(id);
        for (WorkItem workItem : workItems) {
            workItem.setEpic(null);
            workItemRepository.save(workItem);
        }

        // Remove epic reference from cost assignments
        List<CostAssignment> costAssignments = costAssignmentRepository.findByEpicId(id);
        costAssignmentRepository.deleteAll(costAssignments);

        // Remove epic reference from person assignments
        List<PersonAssignment> personAssignments = personAssignmentRepository.findByEpicId(id);
        personAssignmentRepository.deleteAll(personAssignments);

        // Finally, delete the epic
        epicRepository.delete(epic);
    }
} 