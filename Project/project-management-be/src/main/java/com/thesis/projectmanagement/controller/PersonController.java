package com.thesis.projectmanagement.controller;

import com.thesis.projectmanagement.dto.PersonDTO;
import com.thesis.projectmanagement.service.PersonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/persons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PersonController {
    private final PersonService personService;

    @GetMapping
    public ResponseEntity<List<PersonDTO>> getAllPersons() {
        return ResponseEntity.ok(personService.getAllPersons());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonDTO> getPerson(@PathVariable Long id) {
        return ResponseEntity.ok(personService.getPersonById(id));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<PersonDTO>> getPersonsByRole(@PathVariable String role) {
        return ResponseEntity.ok(personService.getPersonsByRole(role));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<PersonDTO> getPersonByEmail(@PathVariable String email) {
        return ResponseEntity.ok(personService.getPersonByEmail(email));
    }

    @PostMapping
    public ResponseEntity<PersonDTO> createPerson(@RequestBody PersonDTO personDTO) {
        return ResponseEntity.ok(personService.createPerson(personDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonDTO> updatePerson(
            @PathVariable Long id,
            @RequestBody PersonDTO personDTO) {
        return ResponseEntity.ok(personService.updatePerson(id, personDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerson(@PathVariable Long id) {
        personService.deletePerson(id);
        return ResponseEntity.noContent().build();
    }
} 