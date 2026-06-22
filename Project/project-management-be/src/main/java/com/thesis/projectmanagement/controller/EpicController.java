package com.thesis.projectmanagement.controller;

import com.thesis.projectmanagement.dto.EpicDTO;
import com.thesis.projectmanagement.service.EpicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/epics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EpicController {
    private final EpicService epicService;

    @GetMapping
    public ResponseEntity<List<EpicDTO>> getAllEpics() {
        return ResponseEntity.ok(epicService.getAllEpics());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EpicDTO> getEpic(@PathVariable Long id) {
        return ResponseEntity.ok(epicService.getEpicById(id));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<EpicDTO>> getEpicsByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(epicService.getEpicsByProjectId(projectId));
    }

    @PostMapping
    public ResponseEntity<EpicDTO> createEpic(@RequestBody EpicDTO epicDTO) {
        return ResponseEntity.ok(epicService.createEpic(epicDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EpicDTO> updateEpic(
            @PathVariable Long id,
            @RequestBody EpicDTO epicDTO) {
        return ResponseEntity.ok(epicService.updateEpic(id, epicDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEpic(@PathVariable Long id) {
        epicService.deleteEpic(id);
        return ResponseEntity.noContent().build();
    }
} 