package com.thesis.projectmanagement.mapper;

import com.thesis.projectmanagement.dto.PersonDTO;
import com.thesis.projectmanagement.model.Person;
import org.springframework.stereotype.Component;

@Component
public class PersonMapper {
    
    public PersonDTO toDTO(Person entity) {
        if (entity == null) {
            return null;
        }
        
        return PersonDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .role(entity.getRole())
                .build();
    }
    
    public Person toEntity(PersonDTO dto) {
        if (dto == null) {
            return null;
        }
        
        return Person.builder()
                .id(dto.getId())
                .name(dto.getName())
                .email(dto.getEmail())
                .role(dto.getRole())
                .build();
    }
    
    public void updateEntityFromDTO(PersonDTO dto, Person entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        if (dto.getName() != null) {
            entity.setName(dto.getName());
        }
        if (dto.getEmail() != null) {
            entity.setEmail(dto.getEmail());
        }
        if (dto.getRole() != null) {
            entity.setRole(dto.getRole());
        }
    }
} 