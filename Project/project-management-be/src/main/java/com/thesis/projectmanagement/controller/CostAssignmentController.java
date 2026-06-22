package com.thesis.projectmanagement.controller;

import com.thesis.projectmanagement.dto.CostAssignmentDTO;
import com.thesis.projectmanagement.service.CostAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cost-assignments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CostAssignmentController {
    private final CostAssignmentService costAssignmentService;

    @GetMapping
    public ResponseEntity<List<CostAssignmentDTO>> getAllCostAssignments() {
        return ResponseEntity.ok(costAssignmentService.getAllCostAssignments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CostAssignmentDTO> getCostAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(costAssignmentService.getCostAssignment(id));
    }

    @GetMapping("/cost/{costId}")
    public ResponseEntity<List<CostAssignmentDTO>> getCostAssignmentsByCostId(@PathVariable Long costId) {
        return ResponseEntity.ok(costAssignmentService.getCostAssignmentsByCostId(costId));
    }

    @GetMapping("/epic/{epicId}")
    public ResponseEntity<List<CostAssignmentDTO>> getCostAssignmentsByEpicId(@PathVariable Long epicId) {
        return ResponseEntity.ok(costAssignmentService.getCostAssignmentsByEpicId(epicId));
    }

    @GetMapping("/work-item/{workItemId}")
    public ResponseEntity<List<CostAssignmentDTO>> getCostAssignmentsByWorkItemId(@PathVariable Long workItemId) {
        return ResponseEntity.ok(costAssignmentService.getCostAssignmentsByWorkItemId(workItemId));
    }

    @PostMapping
    public ResponseEntity<CostAssignmentDTO> createCostAssignment(@RequestBody CostAssignmentDTO costAssignmentDTO) {
        return ResponseEntity.ok(costAssignmentService.createCostAssignment(costAssignmentDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CostAssignmentDTO> updateCostAssignment(
            @PathVariable Long id,
            @RequestBody CostAssignmentDTO costAssignmentDTO) {
        return ResponseEntity.ok(costAssignmentService.updateCostAssignment(id, costAssignmentDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCostAssignment(@PathVariable Long id) {
        costAssignmentService.deleteCostAssignment(id);
        return ResponseEntity.noContent().build();
    }
} 