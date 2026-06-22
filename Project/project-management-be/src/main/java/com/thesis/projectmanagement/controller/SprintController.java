package com.thesis.projectmanagement.controller;

import com.thesis.projectmanagement.dto.SprintDTO;
import com.thesis.projectmanagement.service.SprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SprintController {
    private final SprintService sprintService;

    @GetMapping
    public ResponseEntity<List<SprintDTO>> getAllSprints() {
        return ResponseEntity.ok(sprintService.getAllSprints());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SprintDTO> getSprint(@PathVariable Long id) {
        return ResponseEntity.ok(sprintService.getSprintById(id));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<SprintDTO>> getSprintsByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(sprintService.getSprintsByProjectId(projectId));
    }

    @PostMapping
    public ResponseEntity<SprintDTO> createSprint(@RequestBody SprintDTO sprintDTO) {
        return ResponseEntity.ok(sprintService.createSprint(sprintDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SprintDTO> updateSprint(
            @PathVariable Long id,
            @RequestBody SprintDTO sprintDTO) {
        return ResponseEntity.ok(sprintService.updateSprint(id, sprintDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable Long id) {
        sprintService.deleteSprint(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<SprintDTO> startSprint(@PathVariable Long id) {
        return ResponseEntity.ok(sprintService.startSprint(id));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<SprintDTO> completeSprint(@PathVariable Long id) {
        return ResponseEntity.ok(sprintService.completeSprint(id));
    }

    @PostMapping("/{id}/complete/{targetSprintId}")
    public ResponseEntity<SprintDTO> completeSprint(
            @PathVariable Long id,
            @PathVariable Long targetSprintId) {
        return ResponseEntity.ok(sprintService.completeSprint(id, targetSprintId));
    }
} 