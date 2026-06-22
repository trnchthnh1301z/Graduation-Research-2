package com.thesis.projectmanagement.service;

import com.thesis.projectmanagement.dto.PersonDTO;
import com.thesis.projectmanagement.mapper.PersonMapper;
import com.thesis.projectmanagement.model.Person;
import com.thesis.projectmanagement.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PersonService {
    private final PersonRepository personRepository;
    private final PersonMapper personMapper;

    public List<PersonDTO> getAllPersons() {
        return personRepository.findAll().stream()
                .map(personMapper::toDTO)
                .collect(Collectors.toList());
    }

    public PersonDTO getPersonById(Long id) {
        return personRepository.findById(id)
                .map(personMapper::toDTO)
                .orElseThrow(() -> new IllegalArgumentException("Person not found with id: " + id));
    }

    public List<PersonDTO> getPersonsByRole(String role) {
        return personRepository.findByRole(role).stream()
                .map(personMapper::toDTO)
                .collect(Collectors.toList());
    }

    public PersonDTO getPersonByEmail(String email) {
        return personRepository.findByEmail(email)
                .map(personMapper::toDTO)
                .orElseThrow(() -> new IllegalArgumentException("Person not found with email: " + email));
    }

    @Transactional
    public PersonDTO createPerson(PersonDTO personDTO) {
        validateEmail(personDTO.getEmail());
        Person person = personMapper.toEntity(personDTO);
        person = personRepository.save(person);
        return personMapper.toDTO(person);
    }

    @Transactional
    public PersonDTO updatePerson(Long id, PersonDTO personDTO) {
        Person existingPerson = personRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Person not found with id: " + id));
        
        if (personDTO.getEmail() != null && !personDTO.getEmail().equals(existingPerson.getEmail())) {
            validateEmail(personDTO.getEmail());
        }
        
        personMapper.updateEntityFromDTO(personDTO, existingPerson);
        existingPerson = personRepository.save(existingPerson);
        return personMapper.toDTO(existingPerson);
    }

    @Transactional
    public void deletePerson(Long id) {
        if (!personRepository.existsById(id)) {
            throw new IllegalArgumentException("Person not found with id: " + id);
        }
        personRepository.deleteById(id);
    }

    private void validateEmail(String email) {
        personRepository.findByEmail(email).ifPresent(person -> {
            throw new IllegalArgumentException("Person with email '" + email + "' already exists");
        });
    }
} 