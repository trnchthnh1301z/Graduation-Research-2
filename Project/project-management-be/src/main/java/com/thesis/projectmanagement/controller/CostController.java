package com.thesis.projectmanagement.controller;

import com.thesis.projectmanagement.dto.CostDTO;
import com.thesis.projectmanagement.service.CostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/costs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CostController {
    private final CostService costService;

    @GetMapping
    public ResponseEntity<List<CostDTO>> getAllCosts() {
        return ResponseEntity.ok(costService.getAllCosts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CostDTO> getCost(@PathVariable Long id) {
        return ResponseEntity.ok(costService.getCostById(id));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<CostDTO>> getCostsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(costService.getCostsByCategory(category));
    }

    @PostMapping
    public ResponseEntity<CostDTO> createCost(@RequestBody CostDTO costDTO) {
        return ResponseEntity.ok(costService.createCost(costDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CostDTO> updateCost(
            @PathVariable Long id,
            @RequestBody CostDTO costDTO) {
        return ResponseEntity.ok(costService.updateCost(id, costDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCost(@PathVariable Long id) {
        costService.deleteCost(id);
        return ResponseEntity.noContent().build();
    }
} 