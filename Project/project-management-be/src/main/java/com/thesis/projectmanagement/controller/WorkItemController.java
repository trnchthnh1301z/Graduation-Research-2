package com.thesis.projectmanagement.controller;

import com.thesis.projectmanagement.dto.WorkItemDTO;
import com.thesis.projectmanagement.service.WorkItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-items")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkItemController {
    private final WorkItemService workItemService;

    @GetMapping
    public ResponseEntity<List<WorkItemDTO>> getAllWorkItems() {
        return ResponseEntity.ok(workItemService.getAllWorkItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkItemDTO> getWorkItem(@PathVariable Long id) {
        return ResponseEntity.ok(workItemService.getWorkItemById(id));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<WorkItemDTO>> getWorkItemsByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(workItemService.getWorkItemsByProjectId(projectId));
    }

    @GetMapping("/epic/{epicId}")
    public ResponseEntity<List<WorkItemDTO>> getWorkItemsByEpicId(@PathVariable Long epicId) {
        return ResponseEntity.ok(workItemService.getWorkItemsByEpicId(epicId));
    }

    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<List<WorkItemDTO>> getWorkItemsBySprintId(@PathVariable Long sprintId) {
        return ResponseEntity.ok(workItemService.getWorkItemsBySprintId(sprintId));
    }

    @PostMapping
    public ResponseEntity<WorkItemDTO> createWorkItem(@RequestBody WorkItemDTO workItemDTO) {
        return ResponseEntity.ok(workItemService.createWorkItem(workItemDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkItemDTO> updateWorkItem(
            @PathVariable Long id,
            @RequestBody WorkItemDTO workItemDTO) {
        return ResponseEntity.ok(workItemService.updateWorkItem(id, workItemDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkItem(@PathVariable Long id) {
        workItemService.deleteWorkItem(id);
        return ResponseEntity.noContent().build();
    }
} 