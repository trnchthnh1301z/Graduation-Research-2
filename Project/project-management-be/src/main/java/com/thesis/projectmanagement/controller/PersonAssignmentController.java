package com.thesis.projectmanagement.controller;

import com.thesis.projectmanagement.dto.PersonAssignmentDTO;
import com.thesis.projectmanagement.service.PersonAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/person-assignments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PersonAssignmentController {
    private final PersonAssignmentService personAssignmentService;

    @GetMapping
    public ResponseEntity<List<PersonAssignmentDTO>> getAllPersonAssignments() {
        return ResponseEntity.ok(personAssignmentService.getAllPersonAssignments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonAssignmentDTO> getPersonAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(personAssignmentService.getPersonAssignment(id));
    }

    @GetMapping("/person/{personId}")
    public ResponseEntity<List<PersonAssignmentDTO>> getPersonAssignmentsByPersonId(@PathVariable Long personId) {
        return ResponseEntity.ok(personAssignmentService.getPersonAssignmentsByPersonId(personId));
    }

    @GetMapping("/epic/{epicId}")
    public ResponseEntity<List<PersonAssignmentDTO>> getPersonAssignmentsByEpicId(@PathVariable Long epicId) {
        return ResponseEntity.ok(personAssignmentService.getPersonAssignmentsByEpicId(epicId));
    }

    @GetMapping("/work-item/{workItemId}")
    public ResponseEntity<List<PersonAssignmentDTO>> getPersonAssignmentsByWorkItemId(@PathVariable Long workItemId) {
        return ResponseEntity.ok(personAssignmentService.getPersonAssignmentsByWorkItemId(workItemId));
    }

    @PostMapping
    public ResponseEntity<PersonAssignmentDTO> createPersonAssignment(@RequestBody PersonAssignmentDTO personAssignmentDTO) {
        return ResponseEntity.ok(personAssignmentService.createPersonAssignment(personAssignmentDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonAssignmentDTO> updatePersonAssignment(
            @PathVariable Long id,
            @RequestBody PersonAssignmentDTO personAssignmentDTO) {
        return ResponseEntity.ok(personAssignmentService.updatePersonAssignment(id, personAssignmentDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePersonAssignment(@PathVariable Long id) {
        personAssignmentService.deletePersonAssignment(id);
        return ResponseEntity.noContent().build();
    }
} 